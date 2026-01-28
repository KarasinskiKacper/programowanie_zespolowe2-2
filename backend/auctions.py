from flask_socketio import join_room, leave_room, emit
from threading import Lock
from collections import defaultdict
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import desc
from db_objects import AuctionPriceHistory, Auctions, db
from datetime import datetime, timedelta
import logging
from app_state import socketio

# TODO add scheduled auction opening

# TODO remove debug logging
logging.basicConfig(level=logging.CRITICAL)
logger = logging.getLogger("auctions_scheduler_test")

_auction_locks = defaultdict(Lock)

SCHEDULER = None
APP = None

@socketio.on('join')
def handle_join(data):
    print("join event received:", data)
    if not 'auction' in data.keys():
        emit('error', {'message': 'Invalid data format', 'code': 0})
        return
    auction = data['auction']
    if not auction:
        emit('error', {'message': 'Missing auction to join', 'code': 1})
        return
    
    join_room(auction)

    emit('user_joined', {'auction': auction})

@socketio.on('leave')
def handle_leave(data):
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
    return _auction_locks[auction_id]

def get_next_auction_to_close():
    active_auctions = Auctions.query.filter(Auctions.status == 'at_auction').all()

    if not active_auctions:
        return None
    
    next_auction = min(active_auctions, key=lambda auction: auction.end_date + timedelta(seconds=auction.overtime or 0))

    return next_auction

def get_next_auction_to_open():
    upcoming_auctions = Auctions.query.filter(Auctions.status == 'not_issued').all()

    if not upcoming_auctions:
        return None
    
    next_auction = min(upcoming_auctions, key=lambda auction: auction.start_date)

    return next_auction

def close_auction_if_ended(auction_id, expected_overtime=0):
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
    global SCHEDULER, APP
    APP = app
    SCHEDULER = BackgroundScheduler()
    SCHEDULER.start()

    logger.debug("Scheduler started.")

    with APP.app_context():
        schedule_next_auction()
        schedule_open_next_auction()

    return SCHEDULER

def on_auction_update():
    with APP.app_context():
        schedule_next_auction()
        schedule_open_next_auction()
