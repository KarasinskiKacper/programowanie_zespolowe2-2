from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy import func

db = SQLAlchemy()

class Auction(db.Model):
    __tablename__ = 'auction'
    id_auction = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_item = db.Column(db.Integer, ForeignKey('auction_item.id_item'), nullable=False)
    start_price = db.Column(db.Float(10, 2), nullable=False)
    start_auction = db.Column(db.DateTime, nullable=False)
    end_auction = db.Column(db.DateTime, nullable=False)
    overtime_auction = db.Column(db.Integer, nullable=False, default=0)
    id_winner = db.Column(db.Integer, ForeignKey('users.id_user'), nullable=True)
    
    def to_dict(self):
        return {
            'id_auction': self.id_auction,
            'id_item': self.id_item,
            'start_price': self.start_price,
            'start_auction': self.start_auction,
            'end_auction': self.end_auction,
            'overtime_auction': self.overtime_auction,
            'id_winner': self.id_winner
        }
    
    
class AuctionItem(db.Model):
    __tablename__ = 'auction_item'
    id_item = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(2048), nullable=True)
    id_seller = db.Column(db.Integer, ForeignKey('users.id_user'), nullable=False)
    status = db.Column(db.Enum('at_auction','sold','not_issued'), nullable=False)
    
    def to_dict(self):
        return {
            'id_item': self.id_item,
            'name': self.name,
            'description': self.description,
            'id_seller': self.id_seller,
            'status': self.status
        }
    
class AuctionPriceHistory(db.Model):
    __tablename__ = 'auction_price_history'
    id_price_history = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_auction = db.Column(db.Integer, ForeignKey('auctions.id_auction'), nullable=False)
    id_users = db.Column(db.Integer, ForeignKey('users.id_users'), nullable=False)
    new_price = db.Column(db.Float(10, 2), nullable=False)
    date_price_reprint = db.Column(db.DateTime, nullable=False, default=func.now())
    
    def to_dict(self):
        return {
            'id_price_history': self.id_price_history,
            'id_auction': self.id_auction,
            'id_users': self.id_users,
            'new_price': self.new_price,
            'date_price_reprint': self.date_price_reprint
        }
    
class Categories(db.Model):
    __tablename__ = 'categories'
    id_categories = db.Column(db.Integer, primary_key=True, autoincrement=True)
    categories_name = db.Column(db.String(255), nullable=False)
    
    def to_dict(self):
        return {
            'id_categories': self.id_categories,
            'categories_name': self.categories_name
        }
    
class CategoriesItem(db.Model):
    __tablename__ = 'categories_item'
    id_cat = db.Column(db.Integer, ForeignKey('categories.id_category'), primary_key=True, nullable=False)
    id_item = db.Column(db.Integer, ForeignKey('auction_item.id_item'), primary_key=True, nullable=False)
    
    def to_dict(self):
        return {
            'id_cat': self.id_cat,
            'id_item': self.id_item
        }
   
class PhotosItem(db.Model):
    __tablename__ = 'photos_item'
    id_photo = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_item = db.Column(db.Integer, ForeignKey('auction_item.id_item'), nullable=False)
    photo = db.Column(db.String(512), nullable=False)
    is_main_photo = db.Column(db.Boolean, nullable=False, default=False)
    
    def to_dict(self):
        return {
            'id_photo': self.id_photo,
            'id_item': self.id_item,
            'photo': self.photo,
            'is_main_photo': self.is_main_photo
        }
    
class Users(db.Model):
    __tablename__ = 'users'
    id_user = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(64), nullable=False)
    last_name = db.Column(db.String(64), nullable=False)
    email = db.Column(db.String(128), nullable=False, unique=True)
    password = db.Column(db.String(1024), nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    create_account_date = db.Column(db.DateTime, nullable=False, default=func.now())
    
    def to_dict(self):
        return {
            'id_user': self.id_user,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone_number': self.phone_number,
            'create_account_date': self.create_account_date
        }