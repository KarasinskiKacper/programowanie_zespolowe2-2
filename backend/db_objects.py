from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy import func

db = SQLAlchemy()

class Auctions(db.Model):
    """
    @brief Auction model for buy-now auctions with bidding and overtime.
    
    Stores auction details, seller/winner FKs to Users, status enum.
    Supports bidding history via separate AuctionPriceHistory table.
    """
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
        """
        @brief Serializes auction to JSON-compatible dict.
        
        @return Dict with core fields (excludes description).
        """
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
    """
    @brief Bid history tracking per auction/user with timestamps.

    Records each bid with new_price > previous, price_reprint_date for ordering/conflict resolution.
    Used for highest bid lookup and user bid lists.
    """
    __tablename__ = 'auction_price_history'
    id_price_history = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_auction = db.Column(db.Integer, ForeignKey('auctions.id_auction'), nullable=False)
    id_user = db.Column(db.Integer, ForeignKey('users.id_user'), nullable=False)
    new_price = db.Column(db.Float(10, 2), nullable=False)
    price_reprint_date = db.Column(db.DateTime, nullable=False, default=func.now())
    
    def to_dict(self):
        """
        @brief Serializes bid record to dict.
        
        @return Dict with all fields.
        """
        return {
            'id_price_history': self.id_price_history,
            'id_auction': self.id_auction,
            'id_user': self.id_user,
            'new_price': self.new_price,
            'price_reprint_date': self.price_reprint_date
        }
    
class Categories(db.Model):
    """
    @brief Auction category lookup table.

    Simple id/name pairs, many-to-many with Auctions via CategoriesAuction junction.
    """
    __tablename__ = 'categories'
    id_category = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_name = db.Column(db.String(255), nullable=False)
    
    def to_dict(self):
        """
        @brief Serializes category to basic dict.
        
        @return {'id_category': int, 'category_name': str}
        """
        return {
            'id_category': self.id_category,
            'category_name': self.category_name
        }
    
class CategoriesAuction(db.Model):
    """
    @brief Many-to-many junction between Auctions and Categories.

    Composite PK (id_category, id_auction) FKs to both tables.
    """
    __tablename__ = 'categories_auction'
    id_category = db.Column(db.Integer, ForeignKey('categories.id_category'), primary_key=True, nullable=False)
    id_auction = db.Column(db.Integer, ForeignKey('auctions.id_auction'), primary_key=True, nullable=False)

    def to_dict(self):
        """
        @brief Serializes junction record.
        
        @return {'id_category': int, 'id_auction': int}
        """
        return {
            'id_category': self.id_category,
            'id_auction': self.id_auction
        }
   
class PhotosItem(db.Model):
    """
    @brief Auction photos with main photo flag.

    Stores image paths/URLs per auction. One main photo per auction typical.
    """
    __tablename__ = 'photos_item'
    id_photo = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_auction = db.Column(db.Integer, ForeignKey('auctions.id_auction'), nullable=False)
    photo = db.Column(db.String(512), nullable=False)
    is_main_photo = db.Column(db.Boolean, nullable=False, default=False)
    
    def to_dict(self):
        """
        @brief Serializes photo record.
        
        @return Dict with id_photo, id_auction, photo path/URL, is_main_photo.
        """
        return {
            'id_photo': self.id_photo,
            'id_auction': self.id_auction,
            'photo': self.photo,
            'is_main_photo': self.is_main_photo
        }
    
class Users(db.Model):
    """
    @brief User model for authentication and profiles.

    Stores credentials, profile data.
    Email unique. check_password() for login (insecure equality).
    """
    __tablename__ = 'users'
    id_user = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(64), nullable=False)
    last_name = db.Column(db.String(64), nullable=False)
    email = db.Column(db.String(128), nullable=False, unique=True)
    password = db.Column(db.String(1024), nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    create_account_date = db.Column(db.DateTime, nullable=False, default=func.now())
    
    def check_password(self, password):
        """
        @brief Compares provided password to stored (plain text).
        
        @param password String: Plain password to check.
        
        @return True if matches.
        """
        return self.password == password
    
    def to_dict(self):
        """
        @brief Serializes user excluding password.
        
        @return Profile dict with dates as datetime objects.
        """
        return {
            'id_user': self.id_user,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone_number': self.phone_number,
            'create_account_date': self.create_account_date
        }