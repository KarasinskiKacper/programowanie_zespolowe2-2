from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy import func

db = SQLAlchemy()

class Auctions(db.Model):
    __tablename__ = 'auctions'
    id_auction = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(2048), nullable=True)
    id_seller = db.Column(db.Integer, ForeignKey('users.id_user'), nullable=False)
    start_price = db.Column(db.Float(10, 2), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    overtime = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.Enum('at_auction','sold','not_issued'), nullable=False)
    id_winner = db.Column(db.Integer, ForeignKey('users.id_user'), nullable=True)
    
    def to_dict(self):
        return {
            'id_auction': self.id_auction,
            'title': self.title,
            'id_seller': self.id_seller,
            'start_price': self.start_price,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'overtime': self.overtime,
            'status': self.status,
            'id_winner': self.id_winner
        }
    
    
class AuctionPriceHistory(db.Model):
    __tablename__ = 'auction_price_history'
    id_price_history = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_auction = db.Column(db.Integer, ForeignKey('auctions.id_auction'), nullable=False)
    id_user = db.Column(db.Integer, ForeignKey('users.id_user'), nullable=False)
    new_price = db.Column(db.Float(10, 2), nullable=False)
    price_reprint_date = db.Column(db.DateTime, nullable=False, default=func.now())
    
    def to_dict(self):
        return {
            'id_price_history': self.id_price_history,
            'id_auction': self.id_auction,
            'id_users': self.id_users,
            'new_price': self.new_price,
            'price_reprint_date': self.price_reprint_date
        }
    
class Categories(db.Model):
    __tablename__ = 'categories'
    id_category = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_name = db.Column(db.String(255), nullable=False)
    
    def to_dict(self):
        return {
            'id_category': self.id_category,
            'category_name': self.category_name
        }
    
class CategoriesAuction(db.Model):
    __tablename__ = 'categories_auction'
    id_category = db.Column(db.Integer, ForeignKey('categories.id_category'), primary_key=True, nullable=False)
    id_auction = db.Column(db.Integer, ForeignKey('auctions.id_auction'), primary_key=True, nullable=False)

    def to_dict(self):
        return {
            'id_category': self.id_category,
            'id_auction': self.id_auction
        }
   
class PhotosItem(db.Model):
    __tablename__ = 'photos_item'
    id_photo = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_auction = db.Column(db.Integer, ForeignKey('auctions.id_auction'), nullable=False)
    photo = db.Column(db.String(512), nullable=False)
    is_main_photo = db.Column(db.Boolean, nullable=False, default=False)
    
    def to_dict(self):
        return {
            'id_photo': self.id_photo,
            'id_auction': self.id_auction,
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
    
    def check_password(self, password):
        return self.password == password
    
    def to_dict(self):
        return {
            'id_user': self.id_user,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone_number': self.phone_number,
            'create_account_date': self.create_account_date
        }