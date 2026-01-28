import os
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from db_objects import db
from flask_jwt_extended import JWTManager
from auctions import socketio, start_scheduler
import atexit

def create_app():
    """
    @brief Creates and configures the Flask application instance.

    Loads .env, sets JWT/SQLAlchemy configs, CORS, SocketIO, blueprints.
    Creates upload directory.
    
    @return Configured Flask app instance.
    """
    load_dotenv()
    
    app = Flask(__name__)
    CORS(app)

    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqldb://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config['UPLOAD_DIRECTORY'] = os.getenv('UPLOAD_DIRECTORY')
    app.config['MAX_FILE_SIZE'] = 10 * 1024 * 1024 # 10MB
    app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'webp'}

    os.makedirs(app.config.get('UPLOAD_DIRECTORY'), exist_ok=True) 

    jwt = JWTManager(app)

    socketio.init_app(app)  

    db.init_app(app)

    from routes.Auctions import bp as auctions_bp
    app.register_blueprint(auctions_bp)
    
    from routes.Users import bp as users_bp
    app.register_blueprint(users_bp)

    from routes.Uploads import bp as uploads_bp
    app.register_blueprint(uploads_bp)
    
    from routes.Categories import bp as categories_bp
    app.register_blueprint(categories_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()

    scheduler = start_scheduler(app)
    atexit.register(lambda: scheduler.shutdown())
    socketio.run(app, debug=True, host=os.getenv("BACKEND_HOST"), port=os.getenv("BACKEND_PORT"))
