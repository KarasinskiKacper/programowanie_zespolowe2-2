from flask import Blueprint, request, jsonify
from datetime import datetime
from db_objects import Users, db
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

bp = Blueprint('users', __name__, url_prefix='/api')

@bp.route('/get_user_info', methods=['GET'])
@jwt_required()
def get_user_info():
    """!
    @brief Retrieves profile info for the authenticated user.

    Returns basic user details from JWT identity. No input parameters needed.
    
    @return User profile JSON.
    
    @retval 200 Success: {"first_name", "last_name", "email", "phone_number", "create_account_date"}
    @retval 404 User not found
    """
    current_user_id = get_jwt_identity()
    user = Users.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "create_account_date": user.create_account_date.isoformat()
    }), 200
    
@bp.route('/change_password', methods=['POST'])
@jwt_required()
def change_password():
    """!
    @brief Changes authenticated user's password after old password verification.

    Requires JWT. Validates old_password via check_password(), sets new_password directly.
    
    @param old_password JSON body: Current password (required).
    @param new_password JSON body: New password (required).
    
    @return Success message.
    
    @retval 200 Success: {"message": "Password changed successfully"}
    @retval 400 Missing passwords or incorrect old password
    @retval 404 User not found
    """
    current_user_id = get_jwt_identity()
    user = Users.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({"error": "Old and new passwords are required"}), 400

    if not user.check_password(old_password):
        return jsonify({"error": "Incorrect old password"}), 400

    user.password = data.get('new_password')
    db.session.commit()

    return jsonify({"message": "Password changed successfully"}), 200

@bp.route('/login', methods=['POST'])
def login():
    """!
    @brief Authenticates user and returns JWT access token.

    Validates credentials via user.check_password() method, generates JWT 
    with identity=user.id_user on success.
    
    @param email JSON body: User email (required).
    @param password JSON body: User password (required).
    
    @return JWT token.
    
    @retval 200 Success: {"access_token": "..."}
    @retval 400 Missing credentials
    @retval 401 Invalid email/password
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = Users.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.id_user))
    return jsonify({"access_token": access_token}), 200

@bp.route('/register', methods=['POST'])
def register():
    """!
    @brief Registers a new user and returns JWT access token.

    Validates required fields, checks email uniqueness (no hash—consider bcrypt).
    Creates user with create_account_date, generates JWT for identity=user.id_user.
    
    @param first_name String: Required.
    @param last_name String: Required.
    @param email String: Required, must be unique.
    @param password String: Required (plain text stored).
    @param phone_number String: Optional.
    
    @return JWT token on success.
    
    @retval 201 Success: {"access_token": "..."}
    @retval 400 Missing required fields
    @retval 400 Email already exists
    """
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    phone_number = data.get('phone_number')

    if not first_name or not last_name or not email or not password:
        return jsonify({"error": "All fields except phone number are required"}), 400

    if Users.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    new_user = Users(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password,
        phone_number=phone_number,
        create_account_date=datetime.now()
    )
    db.session.add(new_user)
    db.session.commit()
    
    user = Users.query.filter_by(email=email).first()
    access_token = create_access_token(identity=str(user.id_user))
    return jsonify({"access_token": access_token}), 201

@bp.route('/is_email_taken', methods=['GET'])
def check_email():
    """!
    @brief Checks if an email is already registered.

    Simple existence check for email uniqueness before registration.
    
    @param email Query param: Email address to verify (required).
    
    @return Boolean existence flag.
    
    @retval 200 Success: {"exists": true/false}
    @retval 400 Missing email param
    """
    email = request.args.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user_exists = Users.query.filter_by(email=email).first() is not None
    return jsonify({"exists": bool(user_exists) }), 200