from flask import Blueprint, request, jsonify
from datetime import datetime
from db_objects import Users, db
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

bp = Blueprint('users', __name__, url_prefix='/api')

@bp.route('/get_user_info', methods=['GET'])
@jwt_required()
def get_user_info():
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
    access_token = create_access_token(identity=user.id_user)
    return jsonify({"access_token": access_token}), 201

@bp.route('/is_email_taken', methods=['GET'])
def check_email():
    email = request.args.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user_exists = Users.query.filter_by(email=email).first() is not None
    return jsonify({"exists": bool(user_exists) }), 200