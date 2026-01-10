from flask import Blueprint, request, jsonify
from sqlalchemy import asc, desc, func
from datetime import datetime
from db_objects import Users, db, Auction, PhotosItem, AuctionItem, AuctionPriceHistory
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

bp = Blueprint('auctions', __name__, url_prefix='/api')

@bp.route('/get_all_auctions', methods=['GET'])
def get_all_auctions():
    max_price_subquery = db.session.query(
        AuctionPriceHistory.id_auction,
        db.func.max(AuctionPriceHistory.new_price).label('max_price')
    ).group_by(AuctionPriceHistory.id_auction).subquery()
        
    query = db.session.query(Auction, PhotosItem, AuctionItem, max_price_subquery.c.max_price).join(
        max_price_subquery, Auction.id_auction == max_price_subquery.c.id_auction).join(
        PhotosItem, PhotosItem.id_item == Auction.id_item).filter(PhotosItem.is_main_photo == True).join(
        AuctionItem, AuctionItem.id_item == Auction.id_item).all()
        
    
    results = []
    for auction, photo, auction_item, price_history in query:
        results.append({
            "id_auction": auction.id_auction,
            "id_item": auction.id_item,
            "starting_price": str(auction.start_price),
            "current_price": str(price_history) if price_history else str(auction.starting_price),
            "end_date": auction.end_auction.isoformat(),
            "status": auction_item.status,
            "main_photo": photo.photo,
            "description": auction_item.description
        })
    return jsonify(results), 200

@bp.route('/get_auction_details', methods=['GET'])
def get_auction_details():
    auction_id = request.args.get('id_auction')
    if not auction_id:
        return jsonify({"error": "id_auction parameter is required"}), 400

    auction = Auction.query.get(auction_id)
    if not auction:
        return jsonify({"error": "Auction not found"}), 404

    auction_item = AuctionItem.query.get(auction.id_item)
    photos = PhotosItem.query.filter_by(id_item=auction.id_item).all()
    price_history = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).order_by(desc(AuctionPriceHistory.new_price)).first()
    seller = Users.query.get(auction_item.id_seller)
    winner = Users.query.get(auction.id_winner) if auction.id_winner else None
    
    photo_urls = []
    main_photo = PhotosItem.query.filter(PhotosItem.id_item == auction.id_item, PhotosItem.is_main_photo == True).first()
    
    for photo in photos:
        if not photo.is_main_photo:
            photo_urls.append(photo.photo)
            

    return jsonify({
        "id_auction": auction.id_auction,
        "title": auction_item.name,
        "id_item": auction.id_item,
        "id_seller": auction_item.id_seller,
        "seller_name": seller.first_name + " " + seller.last_name,
        "id_winner": auction.id_winner if auction.id_winner else None,
        "winner_name": (winner.first_name + " " + winner.last_name) if winner else None,        
        "start_price": str(auction.start_price),
        "current_price": str(price_history.new_price) if price_history else str(auction.start_price),
        "end_date": auction.end_auction.isoformat(),
        "overtime_auction": auction.overtime_auction,
        "description": auction_item.description,
        "main_photo": main_photo.photo if main_photo else None,
        "photos": photo_urls,
        "highest bidder": price_history.id_users
    }), 200
    
@bp.route('/create_auction', methods=['POST'])
def create_auction():
    data = request.get_json()
    
    new_auction_item = AuctionItem(
        id_item=data['id_item'],
        name=data['name'],
        description=data['description'],
        id_seller=data['id_seller'],
        status=data['status']
    )
    
    new_auction = Auction(
        id_item=data['id_item'],
        starting_price=data['starting_price'],
        start_date=datetime.fromisoformat(data['start_date']),
        end_date=datetime.fromisoformat(data['end_date'])
    )
    
    
    new_photos = []
    for photo in data['photos']:
        new_photo = PhotosItem(
            id_item=data['id_item'],
            photo=photo['url'],
            is_main_photo=photo['is_main']
        )
        new_photos.append(new_photo)

    db.session.add(new_auction_item)
    db.session.add(new_auction)
    db.session.add_all(new_photos)
    db.session.commit()
    return jsonify({"message": "Auction created successfully"}), 201

@bp.route('/place_bid', methods=['POST'])
def place_bid():
    data = request.get_json()
    auction_id = data.get('id_auction')
    user_id = data.get('id_user')
    new_price = data.get('new_price')

    auction = Auction.query.get(auction_id)
    if not auction:
        return jsonify({"error": "Auction not found"}), 404
    if datetime.now() > auction.end_date + datetime.timedelta(seconds=auction.overtime_auction):
        return jsonify({"error": "Auction has already ended"}), 400
    
    price_history = AuctionPriceHistory(
        id_auction=auction_id,
        id_user=user_id,
        new_price=new_price,
        date_price_reprint=datetime.now()
    )
    db.session.add(price_history)
    db.session.commit()

    return jsonify({"message": "Bid placed successfully"}), 200

@bp.route('/get_user_own_auctions', methods=['GET'])
def get_user_own_auctions():
    user_id = request.args.get('id_user')
    if not user_id:
        return jsonify({"error": "id_user parameter is required"}), 400
    
    seller_id = AuctionItem.query.filter_by(id_seller=user_id).with_entities(AuctionItem.id_seller).subquery()

    auctions = Auction.query.filter_by(id_user=seller_id).all()
    results = []

    for auction in auctions:
        auction_item = AuctionItem.query.get(auction.id_item)
        photo = PhotosItem.query.filter(PhotosItem.id_item==auction.id_item, PhotosItem.is_main_photo==True).first()
        price_history = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).order_by(desc(AuctionPriceHistory.new_price)).first()
        results.append({
            "id_auction": auction.id_auction,
            "id_item": auction.id_item,
            "starting_price": str(auction.starting_price),
            "current_price": str(price_history.new_price) if price_history else str(auction.starting_price),
            "end_date": auction.end_date.isoformat(),
            "title": auction_item.name,
            "main_photo": photo.photo
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
        auction = Auction.query.get(entry.id_auction)
        if auction.end_date + datetime.timedelta(seconds=auction.overtime_auction) < datetime.now():
            continue
        auction_item = AuctionItem.query.get(auction.id_item)
        photo = PhotosItem.query.filter(PhotosItem.id_item==auction.id_item, PhotosItem.is_main_photo==True).first()
        price_history = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).order_by(desc(AuctionPriceHistory.new_price)).first()
        results.append({
            "id_auction": auction.id_auction,
            "id_item": auction.id_item,
            "starting_price": str(auction.starting_price),
            "current_price": str(price_history.new_price) if price_history else str(auction.starting_price),
            "end_date": auction.end_date.isoformat(),
            "title": auction_item.name,
            "main_photo": photo.photo
        })
    return jsonify(results), 200

@bp.route('/archived_auctions', methods=['GET'])
def archived_auctions():
    auctions = Auction.query.filter(Auction.end_date + datetime.timedelta(seconds=Auction.overtime_auction) < datetime.now()).all()
    results = []

    for auction in auctions:
        auction_item = AuctionItem.query.get(auction.id_item)
        photo = PhotosItem.query.filter(PhotosItem.id_item==auction.id_item, PhotosItem.is_main_photo==True).first()
        price_history = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).order_by(desc(AuctionPriceHistory.new_price)).first()
        winner = Users.query.get(auction.id_winner) if auction.id_winner else None
        results.append({
            "id_auction": auction.id_auction,
            "id_item": auction.id_item,
            "starting_price": str(auction.starting_price),
            "final_price": str(price_history.new_price) if price_history else str(auction.starting_price),
            "winner_id": auction.id_winner,
            "winner_name": winner.first_name + " " + winner.last_name,
            "end_date": auction.end_date.isoformat(),
            "title": auction_item.name,
            "main_photo": photo.photo
        })
    return jsonify(results), 200

@bp.route('/delete_auction', methods=['DELETE'])
def delete_auction():
    data = request.get_json()
    auction_id = data.get('id_auction')
    user_id = data.get('id_user')

    auction = Auction.query.get(auction_id)
    if not auction:
        return jsonify({"error": "Auction not found"}), 404

    auction_item = AuctionItem.query.get(auction.id_item)
    
    if auction_item.id_seller != user_id:
        return jsonify({"error": "Unauthorized: Only the seller can delete this auction"}), 403
    
    photos = PhotosItem.query.filter_by(id_item=auction.id_item).all()
    price_histories = AuctionPriceHistory.query.filter_by(id_auction=auction.id_auction).all()

    for photo in photos:
        db.session.delete(photo)
        
    for price_history in price_histories:
        db.session.delete(price_history)
        
    db.session.delete(auction)
    db.session.delete(auction_item)
    db.session.commit()

    return jsonify({"message": "Auction deleted successfully"}), 200