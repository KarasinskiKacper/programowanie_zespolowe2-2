from flask_socketio import SocketIO
from threading import Lock
from collections import defaultdict

socketio = SocketIO(cors_allowed_origins="*")

_auction_locks = defaultdict(Lock)

def get_auction_lock(auction_id):
    return _auction_locks[auction_id]