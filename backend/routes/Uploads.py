import os
import uuid
from flask import Blueprint, request, current_app, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from werkzeug.utils import secure_filename

def allowed_file(filename):
    """
    @brief Validates file extension against app config ALLOWED_EXTENSIONS.

    Case-insensitive check using rsplit for final extension. Defaults to 
    {'png', 'jpg', 'jpeg', 'webp'} if config missing.
    
    @param filename String: File name to validate.
    
    @return True if allowed extension, False otherwise.
    """
    allowed_extensions = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'webp'})
    
    if not filename or '.' not in filename:
        return False
    
    parts = filename.rsplit('.', 1)
    if len(parts) != 2 or parts[0] == '':
        return False

    return parts[1].lower() in allowed_extensions

bp = Blueprint('uploads', __name__, url_prefix='')

@bp.route('/api/upload_image', methods=['POST'])
@jwt_required()
def upload_image():
    """
    @brief Uploads image file, validates type/size, saves with UUID name.

    Requires JWT. Checks 'image' file field, allowed_file(), size <= MAX_FILE_SIZE.
    Saves to UPLOAD_DIRECTORY as UUID.ext, returns relative URL.
    
    @return Image URL on success.
    
    @retval 201 Success: {"image_url": "/uuid.ext"}
    @retval 400 No file, empty name, invalid type, oversized
    """
    upload_directory =  current_app.config.get('UPLOAD_DIRECTORY', 'uploads')
    max_file_size = current_app.config.get('MAX_FILE_SIZE', 10 * 1024 * 1024)  # default: 10MB
    
    os.makedirs(upload_directory, exist_ok=True)

    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image = request.files['image']

    if image.filename == '':
        return jsonify({'error': 'Image filename is empty'}), 400
    
    if not allowed_file(image.filename):
        return jsonify({'error': 'Invalid file type'}), 400
    
    if image.content_length > max_file_size:
        return jsonify({'error': 'Image size exceeds limit'}), 400
    
    extension = secure_filename(image.filename).rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{extension}"

    filepath = os.path.join(upload_directory, unique_filename)
    image.save(filepath)

    image_url = f"/{unique_filename}"

    return jsonify({'image_url': image_url}), 201

@bp.route('/uploads/<filename>', methods=['GET'])
def serve_image(filename):
    """
    @brief Serves uploaded image file by filename.

    Uses send_from_directory with secure_filename for path traversal protection.
    
    @param filename Path param: Uploaded image filename (e.g., "uuid.webp").
    @return Image file stream.
    """
    upload_directory =  current_app.config.get('UPLOAD_DIRECTORY', 'uploads')
    return send_from_directory(upload_directory, secure_filename(filename))
