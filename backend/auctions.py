from flask_socketio import SocketIO, join_room, leave_room, emit
from threading import Lock
from collections import defaultdict
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import desc
from db_objects import AuctionPriceHistory, Auctions, db
from datetime import datetime, timedelta
import logging

# TODO add scheduled auction opening

# TODO remove debug logging
# logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("auctions_scheduler_test")

socketio = SocketIO(cors_allowed_origins="*")

_auction_locks = defaultdict(Lock)

scheduler = None

@socketio.on('join')
def handle_join(data):
    auction = data['auction']
    if not auction:
        emit('error', {'message': 'Missing auction to join', 'code': 1})
        return
    
    join_room(auction)

    emit('user_joined', {'auction': auction})

@socketio.on('leave')
def handle_leave(data):
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

def close_auction_if_ended(auction_id, expected_overtime=0):
    from main import create_app
    app = create_app()
    with app.app_context():
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


def schedule_auction_closure(auction):
    auction_end_time = auction.end_date + timedelta(seconds=auction.overtime or 0)
    job_id = f'close_auction_{auction.id_auction}'

    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)

    scheduler.add_job(
        func=close_auction_if_ended,
        trigger='date',
        run_date=auction_end_time,
        args=[auction.id_auction],
        id=job_id,
        replace_existing=True,
        kwargs={'expected_overtime': auction.overtime}
    )

    logger.debug(f"Scheduled closure for Auction {auction.id_auction} at {auction_end_time} with overtime {auction.overtime} seconds.")

def schedule_next_auction():
    from main import create_app
    app = create_app()
    with app.app_context():
        next_auction = get_next_auction_to_close()
        if next_auction:
            schedule_auction_closure(next_auction)
        else:
            scheduler.add_job(
                func=schedule_next_auction,
                trigger='date',
                run_date=datetime.now() + timedelta(minutes=1),
                replace_existing=True,
            )
            logger.debug("No active auctions to schedule.")

def start_scheduler():
    global scheduler
    scheduler = BackgroundScheduler()
    scheduler.start()

    logger.debug("Scheduler started.")

    from main import create_app
    app = create_app()
    with app.app_context():
        schedule_next_auction()

    return scheduler

def on_auction_update():
    from main import create_app
    app = create_app()  
    with app.app_context():
        schedule_next_auction()