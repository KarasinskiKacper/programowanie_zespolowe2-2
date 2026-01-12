from flask import Blueprint, request, jsonify
from sqlalchemy import asc, desc, func
from datetime import datetime, timedelta
from db_objects import Users, db, Auctions, PhotosItem, AuctionPriceHistory
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

bp = Blueprint('auctions', __name__, url_prefix='/api')

@bp.route('/get_all_auctions', methods=['GET'])
def get_all_auctions():
    max_price_subquery = db.session.query(
        AuctionPriceHistory.id_auction,
        func.max(AuctionPriceHistory.new_price).label('max_price')
    ).group_by(AuctionPriceHistory.id_auction).subquery()
        
    query = db.session.query(Auctions, PhotosItem, max_price_subquery.c.max_price
        ).outerjoin(max_price_subquery, Auctions.id_auction == max_price_subquery.c.id_auction
        ).outerjoin(PhotosItem,(PhotosItem.id_auction == Auctions.id_auction) & (PhotosItem.is_main_photo == True)
        ).all()

    results = []
    for auction, photo, max_price in query:
        current_price = max_price if max_price is not None else auction.start_price
        results.append({
            "id_auction": auction.id_auction,
            "title": auction.title,
            "description": auction.description,
            "id_seller": auction.id_seller,
            "start_price": str(auction.start_price),
            "current_price": str(current_price),
            "start_date": auction.start_date.isoformat() if auction.start_date else None,
            "end_date": auction.end_date.isoformat() if auction.end_date else None,
            "overtime": auction.overtime,
            "status": auction.status,
            "id_winner": auction.id_winner,
            "main_photo": photo.photo if photo else None
        })
    return jsonify(results), 200

@bp.route('/get_auction_details', methods=['GET'])
def get_auction_details():
    auction_id = request.args.get('id_auction')
    if not auction_id:
        return jsonify({"error": "id_auction parameter is required"}), 400

    auction = Auctions.query.get(auction_id)
    if not auction:
        return jsonify({"error": "Auction not found"}), 404

    seller = Users.query.get(auction.id_seller)
    winner = Users.query.get(auction.id_winner) if auction.id_winner else None

    photos = PhotosItem.query.filter_by(id_auction=auction.id_auction).all()
    main_photo = PhotosItem.query.filter(PhotosItem.id_auction==auction.id_auction, PhotosItem.is_main_photo==True).first()

    highest_bid = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).order_by(desc(AuctionPriceHistory.new_price)).first()

    current_price = highest_bid.new_price if highest_bid else auction.start_price
    
    photo_urls = []
    
    for photo in photos:
        if not photo.is_main_photo:
            photo_urls.append(photo.photo)
            

    return jsonify({
        "id_auction": auction.id_auction,
        "title": auction.title,
        "description": auction.description,
        "id_seller": auction.id_seller,
        "seller_name": (seller.first_name + " " + seller.last_name) if seller else None,
        "id_winner": auction.id_winner,
        "winner_name": (winner.first_name + " " + winner.last_name) if winner else None,
        "start_price": str(auction.start_price),
        "current_price": str(current_price),
        "start_date": auction.start_date.isoformat() if auction.start_date else None,
        "end_date": auction.end_date.isoformat() if auction.end_date else None,
        "overtime": auction.overtime,
        "status": auction.status,
        "main_photo": main_photo.photo if main_photo else None,
        "photos": photo_urls,
        "highest_bidder": highest_bid.id_user if highest_bid else None
    }), 200
    
@bp.route('/create_auction', methods=['POST'])
def create_auction():
    data = request.get_json()
    
    required = ["title", "description", "id_seller", "start_price", "start_date", "end_date", "status"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    
    new_auction = Auctions(
        description=data.get("description"),
        title=data["title"],
        id_seller=data["id_seller"],
        start_price=data["start_price"],
        start_date=datetime.fromisoformat(data["start_date"]),
        end_date=datetime.fromisoformat(data["end_date"]),
        overtime=data.get("overtime", 0),
        status=data["status"],
        id_winner=data.get("id_winner")
    )
    
    
    photos = data.get("photos", [])
    new_photos = []
    for p in photos:
        new_photos.append(
            PhotosItem(
                id_auction=new_auction.id_auction,
                photo=p["url"],
                is_main_photo=bool(p.get("is_main", False))
            )
        )

    db.session.add(new_auction)
    db.session.add_all(new_photos)
    db.session.commit()
    return jsonify({"message": "Auction created successfully", "id_auction": new_auction.id_auction}), 201

@bp.route('/place_bid', methods=['POST'])
def place_bid():
    data = request.get_json() or {}

    auction_id = data.get("id_auction")
    user_id = data.get("id_user")
    new_price = data.get("new_price")

    if not auction_id or not user_id or new_price is None:
        return jsonify({"error": "id_auction, id_user, new_price are required"}), 400

    auction = Auctions.query.get(auction_id)
    if not auction:
        return jsonify({"error": "Auction not found"}), 404

    auction_end = auction.end_date + timedelta(seconds=auction.overtime or 0)
    if datetime.now() > auction_end:
        return jsonify({"error": "Auction has already ended"}), 400

    highest_bid = (
        AuctionPriceHistory.query
        .filter_by(id_auction=auction.id_auction)
        .order_by(desc(AuctionPriceHistory.new_price))
        .first()
    )
    current_price = highest_bid.new_price if highest_bid else auction.start_price

    if float(new_price) <= float(current_price):
        return jsonify({"error": "Bid must be higher than current price"}), 400

    price_history = AuctionPriceHistory(
        id_auction=auction.id_auction,
        id_user=user_id,
        new_price=new_price,
        price_reprint_date=datetime.now()
    )

    db.session.add(price_history)
    db.session.commit()

    return jsonify({"message": "Bid placed successfully"}), 200

@bp.route('/get_user_own_auctions', methods=['GET'])
def get_user_own_auctions():
    user_id = request.args.get('id_user')
    if not user_id:
        return jsonify({"error": "id_user parameter is required"}), 400
    

    auctions = Auctions.query.filter_by(id_seller=user_id).all()
    results = []

    for auction in auctions:
        photo = PhotosItem.query.filter(PhotosItem.id_auction==auction.id_auction, PhotosItem.is_main_photo==True).first()
        highest_bid = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).order_by(desc(AuctionPriceHistory.new_price)).first()
        
        current_price = highest_bid.new_price if highest_bid else auction.start_price

        results.append({
            "id_auction": auction.id_auction,
            "title": auction.title,
            "description": auction.description,
            "start_price": str(auction.start_price),
            "current_price": str(current_price),
            "start_date": auction.start_date.isoformat() if auction.start_date else None,
            "end_date": auction.end_date.isoformat() if auction.end_date else None,
            "overtime": auction.overtime,
            "status": auction.status,
            "id_winner": auction.id_winner,
            "main_photo": photo.photo if photo else None
        })
    return jsonify(results), 200

@bp.route('/get_user_auctions', methods=['GET'])
def get_user_auctions():
    user_id = request.args.get('id_user')
    if not user_id:
        return jsonify({"error": "id_user parameter is required"}), 400

    entries = AuctionPriceHistory.query.filter_by(id_user=user_id).with_entities(AuctionPriceHistory.id_auction).distinct().all()
    
    results = []

    for entry in entries:
        auction = Auctions.query.get(entry.id_auction)
        if auction.end_date + timedelta(seconds=auction.overtime) < datetime.now():
            continue
        photo = PhotosItem.query.filter(PhotosItem.id_auction==auction.id_auction, PhotosItem.is_main_photo==True).first()
        highest_bid = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).order_by(desc(AuctionPriceHistory.new_price)).first()
        
        current_price = highest_bid.new_price if highest_bid else auction.start_price
        
        results.append({
            "id_auction": auction.id_auction,
            "description": auction.description,
            "starting_price": str(auction.start_price),
            "current_price": str(current_price),
            "end_date": auction.end_date.isoformat(),
            "overtime": auction.overtime,
            "title": auction.title,
            "main_photo": photo.photo,
            "status": auction.status
        })
    return jsonify(results), 200

@bp.route('/archived_auctions', methods=['GET'])
def archived_auctions():
    user_id = request.args.get('id_user')
    if not user_id:
        return jsonify({"error": "id_user parameter is required"}), 400
    
    auctions = Auctions.query.filter(Auctions.id_seller == user_id).all()
    
    results = []

    for auction in auctions:
        auction_end = auction.end_date + timedelta(seconds=auction.overtime or 0)
        if auction_end >= datetime.now():
            continue
        
        photo = PhotosItem.query.filter(PhotosItem.id_auction==auction.id_auction, PhotosItem.is_main_photo==True).first()
        highest_bid = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).order_by(desc(AuctionPriceHistory.new_price)).first()
        winner = Users.query.get(auction.id_winner) if auction.id_winner else None
        
        current_price = highest_bid.new_price if highest_bid else auction.start_price
        
        results.append({
            "id_auction": auction.id_auction,
            "description": auction.description,
            "starting_price": str(auction.start_price),
            "final_price": str(current_price),
            "winner_id": auction.id_winner,
            "winner_name": winner.first_name + " " + winner.last_name if winner else None,
            "end_date": auction.end_date.isoformat() if auction.end_date else None,
            "title": auction.title,
            "main_photo": photo.photo if photo else None
        })
    return jsonify(results), 200

@bp.route('/delete_auction', methods=['POST'])
def delete_auction():
    data = request.get_json()
    auction_id = data.get('id_auction')
    user_id = data.get('id_user')
    
    if not auction_id or not user_id:
        return jsonify({"error": "id_auction and id_user are required"}), 400

    auction = Auctions.query.get(auction_id)
    if not auction:
        return jsonify({"error": "Auction not found"}), 404
    
    if int(auction.id_seller) != int(user_id):
        return jsonify({"error": "Unauthorized: Only the seller can delete this auction"}), 403
    
    photos = PhotosItem.query.filter_by(id_auction=auction.id_auction).all()
    bids = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).all()

    for photo in photos:
        db.session.delete(photo)
        
    for bid in bids:
        db.session.delete(bid)
        
    db.session.delete(auction)
    db.session.commit()

    return jsonify({"message": "Auction deleted successfully"}), 200