from flask_socketio import join_room, leave_room, emit
from threading import Lock
from collections import defaultdict
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import desc
from db_objects import AuctionPriceHistory, Auctions, db
from datetime import datetime, timedelta
import logging
from app_state import socketio

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger("auctions_scheduler_test")

_auction_locks = defaultdict(Lock)

SCHEDULER = None
APP = None

@socketio.on('join')
def handle_join(data):
    """!
    @brief Handles client joining auction SocketIO room.

    Validates 'auction' field, calls join_room(). Broadcasts user_joined confirmation.
    
    @param data Dict: {'auction': room_id str/int}
    
    @note Emits 'error' code 0/1 on fail; 'user_joined' success to room.
    
    @return None (room ops + emit).
    """
    print("join event received:", data)
    if not 'auction' in data.keys():
        emit('error', {'message': 'Invalid data format', 'code': 0})
        return
    auction = data['auction']
    if not auction:
        emit('error', {'message': 'Missing auction to join', 'code': 1})
        return
    join_room(f"{auction}")

    emit('user_joined', {'auction': auction})

@socketio.on('leave')
def handle_leave(data):
    """!
    @brief Handles client leaving auction SocketIO room.

    Validates 'auction' in data, calls leave_room(). Broadcasts user_left to room.
    
    @param data Dict: {'auction': room_id str/int}
    
    @note Emits 'error' on validation fail; 'user_left' success to room.
    
    @return None (room ops + emit).
    """
    print("leave event received:", data)
    if not 'auction' in data.keys():
        emit('error', {'message': 'Invalid data format', 'code': 0})
        return
    auction = data['auction']
    if not auction:
        emit('error', {'message': 'Missing auction to leave', 'code': 2})
        return
    
    leave_room(auction)

    emit('user_left', {'auction': auction})

def get_auction_lock(auction_id):
    """!
    @brief Returns the lock object for auction-specific synchronization.

    Assumes _auction_locks dict populated elsewhere (e.g., on-demand RLock).
    
    @param auction_id Integer/String: Auction identifier.
    
    @note Global/shared _auction_locks; ensure initialized before use.
    
    @return Lock instance for auction_id (e.g., threading.RLock).
    """
    return _auction_locks[auction_id]

def get_next_auction_to_close():
    """!
    @brief Finds the active auction ending soonest (end_date + overtime).

    Queries 'at_auction' status auctions, returns min by computed end time.
    
    @return Auction instance closest to ending, or None if none active.
    """
    active_auctions = Auctions.query.filter(Auctions.status == 'at_auction').all()

    if not active_auctions:
        return None
    
    next_auction = min(active_auctions, key=lambda auction: auction.end_date + timedelta(seconds=auction.overtime or 0))

    return next_auction

def get_next_auction_to_open():
    """!
    @brief Opens 'not_issued' auction to 'at_auction' status.

    Updates status, commits, schedules closure. Reschedules next open if invalid.
    
    @param auction_id Integer: Auction to open.
    
    @note Idempotent: skips if wrong status, chains to closure scheduling.
    
    @return None (DB update + scheduling).
    """
    upcoming_auctions = Auctions.query.filter(Auctions.status == 'not_issued').all()

    if not upcoming_auctions:
        return None
    
    next_auction = min(upcoming_auctions, key=lambda auction: auction.start_date)

    return next_auction

def close_auction_if_ended(auction_id, expected_overtime=0):
    """!
    @brief Closes auction if ended, handling concurrent overtime changes.

    App context check: refreshes auction under lock, verifies end time vs expected_overtime.
    Sets status='sold', highest bidder as winner. Emits SocketIO, reschedules next.
    
    @param auction_id Integer: Auction to potentially close.
    @param expected_overtime Integer: Expected overtime at scheduling (default 0).
    
    @note Idempotent: reschedules if not ended or overtime changed.
    
    @return None (DB update + emit side-effects).
    """
    with APP.app_context():
        auction = Auctions.query.get(auction_id)

        if not auction or auction.status != 'at_auction':
            logger.debug(f"Auction {auction_id} not found or not active.")
            schedule_next_auction()
            return
        
        lock = get_auction_lock(auction_id)
        with lock:
            db.session.refresh(auction)

            timestamp = datetime.now()
            auction_end_time = auction.end_date + timedelta(seconds=auction.overtime or 0)

            if auction.overtime > expected_overtime:
                logger.debug(f"Auction {auction_id} overtime changed from {expected_overtime} to {auction.overtime}. Rescheduling closure.")
                schedule_next_auction()
                return
            
            if timestamp < auction_end_time:
                logger.debug(f"Auction {auction_id} has not ended yet. Current time: {timestamp}, End time: {auction_end_time}. Rescheduling closure.")
                schedule_next_auction()
                return

            highest_bid = (
            AuctionPriceHistory.query
            .filter_by(id_auction=auction.id_auction)
            .order_by(desc(AuctionPriceHistory.new_price))
            .first())

            auction.status = 'sold'
            if highest_bid:
                auction.id_winner = highest_bid.id_user
                logger.debug(f"Auction {auction_id} closed. Winner: User {highest_bid.id_user} with bid {highest_bid.new_price}.")
            else:
                auction.id_winner = None
                logger.debug(f"Auction {auction_id} closed with no bids.")

            db.session.commit()

        socketio.emit('auction_closed', {
            'id_auction': auction.id_auction,
            'id_winner': auction.id_winner
        }, to=f'auction_{auction.id_auction}')

        schedule_next_auction()

def open_auction(auction_id):
    """!
    @brief Opens 'not_issued' auction to 'at_auction' status.

    Updates status, commits, schedules closure. Reschedules next open if invalid.
    
    @param auction_id Integer: Auction to open.
    
    @note Idempotent: skips wrong status, chains to closure scheduling.
    
    @return None (DB update + scheduling).
    """
    with APP.app_context():
        auction = Auctions.query.get(auction_id)

        if not auction or auction.status != 'not_issued':
            logger.debug(f"Auction {auction_id} not found or not scheduled.")
            schedule_open_next_auction()
            return
        
        auction.status = 'at_auction'
        db.session.commit()

        logger.debug(f"Auction {auction_id} is now open for bidding.")
        
        schedule_auction_closure(auction)

def schedule_auction_closure(auction):
    """!
    @brief Schedules auction closure job at end_date + overtime.

    Removes existing job if present, adds new date-trigger job for close_auction_if_ended.
    Passes id_auction as arg, overtime as kwarg.
    
    @param auction Auction instance with end_date, overtime, id_auction.
    
    @note Job ID: 'close_auction_{id_auction}' for uniqueness.
    
    @return None (scheduling side-effect).
    """
    auction_end_time = auction.end_date + timedelta(seconds=auction.overtime or 0)
    job_id = f'close_auction_{auction.id_auction}'

    if SCHEDULER.get_job(job_id):
        SCHEDULER.remove_job(job_id)

    run_date = auction_end_time if auction_end_time > datetime.now() else datetime.now() + timedelta(seconds=1)

    SCHEDULER.add_job(
        func=close_auction_if_ended,
        trigger='date',
        run_date=run_date,
        args=[auction.id_auction],
        id=job_id,
        replace_existing=True,
        kwargs={'expected_overtime': auction.overtime}
    )

    logger.debug(f"Scheduled closure for Auction {auction.id_auction} at {auction_end_time} with overtime {auction.overtime} seconds.")

def schedule_auction_opening(auction):
    """!
    @brief Schedules auction opening job at start_date (or immediate if past).

    Removes existing job, adds date-trigger for open_auction(id_auction).
    
    @param auction Auction instance with start_date, id_auction.
    
    @note Job ID: 'open_auction_{id_auction}'. Runs now+1s if start_date past.
    
    @return None (scheduling side-effect).
    """
    auction_start_time = auction.start_date
    job_id = f'open_auction_{auction.id_auction}'

    if SCHEDULER.get_job(job_id):
        SCHEDULER.remove_job(job_id)

    run_date = auction_start_time if auction_start_time > datetime.now() else datetime.now() + timedelta(seconds=1)

    SCHEDULER.add_job(
        func=open_auction,
        trigger='date',
        run_date=run_date,
        args=[auction.id_auction],
        id=job_id,
        replace_existing=True,
    )
    logger.debug(f"Scheduled opening for Auction {auction.id_auction} at {auction_start_time}.")

def schedule_next_auction():
    """!
    @brief Schedules the next auction closure or reschedules self in 1 minute.

    Creates app context, finds next auction via get_next_auction_to_close().
    Calls schedule_auction_closure() if found, else recurses via scheduler.
    
    @note Uses app factory and scheduler; logs when no auctions.
    
    @return None (scheduling side-effect).
    """
    with APP.app_context():
        next_auction = get_next_auction_to_close()
        if next_auction:
            schedule_auction_closure(next_auction)
        else:
            SCHEDULER.add_job(
                func=schedule_next_auction,
                trigger='date',
                id='schedule_next_auction',
                run_date=datetime.now() + timedelta(minutes=1),
                replace_existing=True,
            )
            logger.debug("No active auctions to schedule.")

def schedule_open_next_auction():
    """!
    @brief Schedules next 'not_issued' auction opening or reschedules self.

    App context finds get_next_auction_to_open(), calls schedule_auction_opening().
    Recurses every 1min if none pending via SCHEDULER job.
    
    @note Uses global APP/SCHEDULER; fixed job ID 'schedule_open_next_auction'.
    
    @return None (scheduling side-effect).
    """
    with APP.app_context():
        next_auction = get_next_auction_to_open()
        if next_auction:
            schedule_auction_opening(next_auction)
        else :
            SCHEDULER.add_job(
                func=schedule_open_next_auction,
                trigger='date',
                id='schedule_open_next_auction',
                run_date=datetime.now() + timedelta(minutes=1),
                replace_existing=True,
            )
            logger.debug("No upcoming auctions to schedule.")

def start_scheduler(app):
    """!
    @brief Initializes scheduler with app context binding.

    Sets global APP for context usage, creates/starts BackgroundScheduler.
    
    @param app Flask app instance.
    
    @note Call before scheduling jobs; globals used in scheduled funcs.
    
    @return None (modifies globals SCHEDULER, APP).
    """
    global SCHEDULER, APP
    APP = app
    SCHEDULER = BackgroundScheduler()
    SCHEDULER.start()
    
def start_scheduler():
    """!
    @brief Initializes and starts BackgroundScheduler with initial auction scheduling.

    Sets global scheduler, starts it, creates app context for schedule_next_auction().
    
    @note Modifies global 'scheduler' variable.
    
    @return Active scheduler instance.
    """
    global scheduler
    scheduler = BackgroundScheduler()
    scheduler.start()

    logger.debug("Scheduler started.")

    with APP.app_context():
        schedule_next_auction()
        schedule_open_next_auction()

    return SCHEDULER

def on_auction_update():
    """!
    @brief Triggers auction scheduling refresh after auction changes.

    Recreates app context and calls schedule_next_auction() to handle updates
    like new bids extending overtime.
    
    @note Call after auction modifications (bids, status changes).
    
    @return None (scheduling side-effect).
    """
    with APP.app_context():
        schedule_next_auction()
        schedule_open_next_auction()
   
    from main import create_app
    app = create_app()  
    with app.app_context():
        schedule_next_auction()
