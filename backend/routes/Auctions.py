from flask import Blueprint, request, jsonify
from sqlalchemy import asc, desc, func
from datetime import datetime, timedelta
from db_objects import CategoriesAuction, Users, db, Auctions, PhotosItem, AuctionPriceHistory, Categories
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from auctions import get_auction_lock, on_auction_update
from app_state import socketio

bp = Blueprint('auctions', __name__, url_prefix='/api')

@bp.route('/get_all_auctions', methods=['GET'])
def get_all_auctions():
    max_price_subquery = db.session.query(
        AuctionPriceHistory.id_auction,
        func.max(AuctionPriceHistory.new_price).label('max_price')
    ).group_by(AuctionPriceHistory.id_auction).subquery()
    
    categories_subquery = (
        db.session.query(
            CategoriesAuction.id_auction,
            func.group_concat(Categories.category_name).label('categories')
        )
        .join(Categories, Categories.id_category == CategoriesAuction.id_category)
        .group_by(CategoriesAuction.id_auction)
        .subquery()
    )
        
    query = db.session.query(Auctions, PhotosItem, max_price_subquery.c.max_price, categories_subquery.c.categories
        ).outerjoin(max_price_subquery, Auctions.id_auction == max_price_subquery.c.id_auction
        ).outerjoin(PhotosItem,(PhotosItem.id_auction == Auctions.id_auction) & (PhotosItem.is_main_photo == True)
        ).outerjoin(categories_subquery, Auctions.id_auction == categories_subquery.c.id_auction
        ).all()

    results = []
    for auction, photo, max_price, categories in query:
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
            "main_photo": photo.photo if photo else None,
            "categories": categories.split(",") if categories else []
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

    cats = db.session.query(Categories.category_name).join(CategoriesAuction, Categories.id_category == CategoriesAuction.id_category).filter(CategoriesAuction.id_auction == auction.id_auction).all()

    categories = []
    for category in cats:
        categories.append(category.category_name)

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
        "highest_bidder": highest_bid.id_user if highest_bid else None,
        "categories": categories
    }), 200
    
@bp.route('/create_auction', methods=['POST'])
@jwt_required()
def create_auction():
    user = Users.query.get( get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 404
    user_id = user.id_user

    data = request.get_json()
    
    required = ["title", "description", "start_price", "start_date", "end_date"]
    
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    
    new_auction = Auctions(
        description=data.get("description"),
        title=data["title"],
        id_seller=user_id,
        start_price=data["start_price"],
        start_date=datetime.fromisoformat(data["start_date"]),
        end_date=datetime.fromisoformat(data["end_date"]),
        overtime= 0,
        status= "at_auction" if datetime.fromisoformat(data["start_date"]) >= datetime.now() else "not_issued",
    )
    
    db.session.add(new_auction)
    db.session.flush()
    db.session.refresh(new_auction)

    photos = data.get("photos", [])
    new_photos = []
    for p in photos:
        print(p)
        new_photos.append(
            PhotosItem(
                id_auction=new_auction.id_auction,
                photo=p["url"],
                is_main_photo=bool(p.get("is_main", False))
            )
        )
        
    categories = data.get("categories", [])
    new_categories = []
    for c in categories:
        new_categories.append(
            CategoriesAuction(
                id_auction=new_auction.id_auction,
                id_category=c
            )
        )

    db.session.add_all(new_categories)
    
    db.session.add_all(new_photos)
    db.session.commit()

    on_auction_update()

    return jsonify({"message": "Auction created successfully", "id_auction": new_auction.id_auction}), 201

@bp.route('/place_bid', methods=['POST'])
@jwt_required()
def place_bid():
    timestamp = datetime.now()

    user = Users.query.get( get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 404
    user_id = user.id_user

    data = request.get_json() or {}

    auction_id = data.get("id_auction")
    new_price = data.get("new_price")

    if not auction_id or new_price is None:
        return jsonify({"error": "id_auction, new_price are required"}), 400

    auction = Auctions.query.get(auction_id)
    if not auction:
        return jsonify({"error": "Auction not found"}), 404

    lock = get_auction_lock(auction_id)
    with lock:
        db.session.refresh(auction)
        if auction.status != "at_auction":
            return jsonify({"error": "Auction is not active"}), 400
        
        auction_end = auction.end_date + timedelta(seconds=auction.overtime or 0)
        if timestamp > auction_end:
            return jsonify({"error": "Bid was placed after the auction ended"}), 400


        highest_bid = (
            AuctionPriceHistory.query
            .filter_by(id_auction=auction.id_auction)
            .order_by(desc(AuctionPriceHistory.new_price))
            .first()
        )
        current_price = highest_bid.new_price if highest_bid else auction.start_price
        last_bid_timestamp = highest_bid.price_reprint_date if highest_bid else None

        if last_bid_timestamp and timestamp < last_bid_timestamp:
            return jsonify({"error": "A newer bid has already been placed"}), 400

        min_increment = 1.0

        if float(new_price) < float(current_price) + min_increment:
            return jsonify({"error": f"Bid must be at least {min_increment} higher than the current price"}), 400

        price_history = AuctionPriceHistory(
            id_auction=auction.id_auction,
            id_user=user_id,
            new_price=new_price,
            price_reprint_date=timestamp
        )

        overtime_changed = False
        if (auction_end - timestamp).total_seconds() < 60:
            auction.overtime += 60
            overtime_changed = True

        db.session.add(price_history)
        db.session.commit()

    if overtime_changed:
        on_auction_update()

    socketio.emit('auction_updated', {
        "id_auction": auction.id_auction,
        "new_price": str(new_price),
        "id_user": user_id,
        "overtime": auction.overtime
    }, to=f'{auction.id_auction}')

    return jsonify({"message": "Bid placed successfully"}), 200

@bp.route('/get_user_own_auctions', methods=['GET'])
@jwt_required()
def get_user_own_auctions():
    user = Users.query.get( get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 404
    user_id = user.id_user

    auctions = Auctions.query.filter_by(id_seller=user_id).all()
    results = []

    for auction in auctions:
        photo = PhotosItem.query.filter(PhotosItem.id_auction==auction.id_auction, PhotosItem.is_main_photo==True).first()
        highest_bid = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).order_by(desc(AuctionPriceHistory.new_price)).first()
        cats = db.session.query(Categories.category_name).join(CategoriesAuction, Categories.id_category == CategoriesAuction.id_category).filter(CategoriesAuction.id_auction == auction.id_auction).all()

        categories = []
        for category in cats:
            categories.append(category.category_name)
        
        
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
            "main_photo": photo.photo if photo else None,
            "categories": categories
        })
    return jsonify(results), 200

@bp.route('/get_user_auctions', methods=['GET'])
@jwt_required()
def get_user_auctions():
    user = Users.query.get( get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 404
    user_id = user.id_user

    entries = AuctionPriceHistory.query.filter_by(id_user=user_id).with_entities(AuctionPriceHistory.id_auction).distinct().all()
    
    results = []

    for entry in entries:
        auction = Auctions.query.get(entry.id_auction)
        if auction.end_date + timedelta(seconds=auction.overtime) < datetime.now():
            continue
        photo = PhotosItem.query.filter(PhotosItem.id_auction==auction.id_auction, PhotosItem.is_main_photo==True).first()
        highest_bid = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).order_by(desc(AuctionPriceHistory.new_price)).first()
        cats = db.session.query(Categories.category_name).join(CategoriesAuction, Categories.id_category == CategoriesAuction.id_category).filter(CategoriesAuction.id_auction == auction.id_auction).all()

        categories = []
        for category in cats:
            categories.append(category.category_name)
        
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
            "status": auction.status,
            "categories": categories
        })
        
    won_auctions = Auctions.query.filter_by(id_winner=user_id).all()
    
    for auction in won_auctions:
        photo = PhotosItem.query.filter(PhotosItem.id_auction==auction.id_auction, PhotosItem.is_main_photo==True).first()
        highest_bid = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).order_by(desc(AuctionPriceHistory.new_price)).first()
        cats = db.session.query(Categories.category_name).join(CategoriesAuction, Categories.id_category == CategoriesAuction.id_category).filter(CategoriesAuction.id_auction == auction.id_auction).all()
        
        categories = []
        for category in cats:
            categories.append(category.category_name)
        
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
            "status": auction.status,
            "categories": categories
        })
            
    return jsonify(results), 200

@bp.route('/archived_auctions', methods=['GET'])
@jwt_required()
def archived_auctions():
    user = Users.query.get( get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 404
    user_id = user.id_user
    
    auctions = Auctions.query.filter(Auctions.id_seller == user_id).all()
    
    results = []

    for auction in auctions:
        auction_end = auction.end_date + timedelta(seconds=auction.overtime or 0)
        if auction_end >= datetime.now():
            continue
        
        photo = PhotosItem.query.filter(PhotosItem.id_auction==auction.id_auction, PhotosItem.is_main_photo==True).first()
        highest_bid = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).order_by(desc(AuctionPriceHistory.new_price)).first()
        winner = Users.query.get(auction.id_winner) if auction.id_winner else None
        
        cats = db.session.query(Categories.category_name).join(CategoriesAuction, Categories.id_category == CategoriesAuction.id_category).filter(CategoriesAuction.id_auction == auction.id_auction).all()

        categories = []
        for category in cats:
            categories.append(category.category_name)
        
        current_price = highest_bid.new_price if highest_bid else auction.start_price
        
        results.append({
            "id_auction": auction.id_auction,
            "description": auction.description,
            "starting_price": str(auction.start_price),
            "current_price": str(current_price),
            "winner_id": auction.id_winner,
            "winner_name": winner.first_name + " " + winner.last_name if winner else None,
            "end_date": auction.end_date.isoformat() if auction.end_date else None,
            "title": auction.title,
            "main_photo": photo.photo if photo else None,
            "categories": categories
        })
    return jsonify(results), 200

@bp.route('/delete_auction', methods=['POST'])
@jwt_required()
def delete_auction():
    user = Users.query.get( get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 404
    user_id = user.id_user

    data = request.get_json()
    auction_id = data.get('id_auction')
    
    if not auction_id:
        return jsonify({"error": "id_auction is required"}), 400

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

    on_auction_update()

    return jsonify({"message": "Auction deleted successfully"}), 200