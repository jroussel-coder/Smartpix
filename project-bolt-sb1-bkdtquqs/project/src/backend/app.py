# backend/app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import uuid
import json
from datetime import datetime, timedelta
from PIL import Image, ImageEnhance, ImageFilter
import threading
import time

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size

# Initialize extensions
jwt = JWTManager(app)
CORS(app)

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

# In-memory storage (replace with database in production)
users_db = []
images_db = []

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_user(user_data):
    """Save user to database"""
    users_db.append(user_data)
    return user_data

def get_user_by_email(email):
    """Get user by email"""
    return next((user for user in users_db if user['email'] == email), None)

def get_user_by_id(user_id):
    """Get user by ID"""
    return next((user for user in users_db if user['id'] == user_id), None)

def save_image(image_data):
    """Save image to database"""
    images_db.append(image_data)
    return image_data

def get_image_by_id(image_id, user_id=None):
    """Get image by ID, optionally filtered by user"""
    for image in images_db:
        if image['id'] == image_id:
            if user_id is None or image['user_id'] == user_id:
                return image
    return None

def get_images_by_user(user_id):
    """Get all images for a user"""
    return [image for image in images_db if image['user_id'] == user_id]

def delete_image_by_id(image_id, user_id):
    """Delete image by ID for a specific user"""
    global images_db
    images_db = [img for img in images_db if not (img['id'] == image_id and img['user_id'] == user_id)]

def process_image_ai(image_path, edit_type, intensity=50):
    """
    Simulate AI image processing
    In production, this would integrate with actual AI services like:
    - OpenAI DALL-E
    - Stability AI
    - Replicate
    - Custom ML models
    """
    try:
        # Open the image
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Apply different enhancements based on edit type
            if edit_type == 'enhance':
                # Auto enhance: improve contrast, brightness, and sharpness
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(1 + (intensity / 100))
                
                enhancer = ImageEnhance.Brightness(img)
                img = enhancer.enhance(1 + (intensity / 200))
                
                enhancer = ImageEnhance.Sharpness(img)
                img = enhancer.enhance(1 + (intensity / 100))
                
            elif edit_type == 'colorize':
                # Colorize: enhance color saturation
                enhancer = ImageEnhance.Color(img)
                img = enhancer.enhance(1 + (intensity / 50))
                
            elif edit_type == 'style':
                # Style transfer: apply a filter effect
                if intensity > 50:
                    img = img.filter(ImageFilter.EDGE_ENHANCE_MORE)
                else:
                    img = img.filter(ImageFilter.SMOOTH_MORE)
                    
            elif edit_type == 'restore':
                # Restore: reduce noise and enhance details
                img = img.filter(ImageFilter.MedianFilter())
                enhancer = ImageEnhance.Sharpness(img)
                img = enhancer.enhance(1 + (intensity / 100))
                
            elif edit_type == 'retouch':
                # Retouch: smooth and enhance
                img = img.filter(ImageFilter.SMOOTH)
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(1 + (intensity / 150))
                
            elif edit_type == 'background':
                # Background: simple blur effect as placeholder
                img = img.filter(ImageFilter.GaussianBlur(radius=intensity/20))
            
            # Generate output filename
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            output_filename = f"{base_name}_edited_{edit_type}_{uuid.uuid4().hex[:8]}.jpg"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            
            # Save the processed image
            img.save(output_path, 'JPEG', quality=95)
            
            return output_filename
            
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return None

# Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'SmartPix API is running'})

# Authentication Routes
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """User registration"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email']
        password = data['password']
        
        # Check if user already exists
        if get_user_by_email(email):
            return jsonify({'error': 'User already exists'}), 400
        
        # Create new user
        user_data = {
            'id': str(uuid.uuid4()),
            'email': email,
            'password': generate_password_hash(password),
            'created_at': datetime.utcnow().isoformat()
        }
        
        save_user(user_data)
        
        # Create access token
        access_token = create_access_token(identity=user_data['id'])
        
        return jsonify({
            'message': 'User created successfully',
            'token': access_token,
            'user': {'id': user_data['id'], 'email': user_data['email']}
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email']
        password = data['password']
        
        # Find user
        user = get_user_by_email(email)
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid credentials'}), 400
        
        # Create access token
        access_token = create_access_token(identity=user['id'])
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {'id': user['id'], 'email': user['email']}
        })
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

# Image Routes
@app.route('/api/images/upload', methods=['POST'])
@jwt_required()
def upload_image():
    """Upload image"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG, WEBP are allowed'}), 400
        
        # Secure the filename and add UUID to prevent conflicts
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
        
        # Save file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Get current user
        current_user_id = get_jwt_identity()
        
        # Create image record
        image_data = {
            'id': str(uuid.uuid4()),
            'user_id': current_user_id,
            'name': filename,
            'original_image_url': f'/uploads/{unique_filename}',
            'edited_image_url': None,
            'edit_type': None,
            'intensity': None,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        save_image(image_data)
        
        return jsonify({
            'message': 'Image uploaded successfully',
            'image': image_data
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to upload image'}), 500

@app.route('/api/images', methods=['GET'])
@jwt_required()
def get_user_images():
    """Get all images for current user"""
    try:
        current_user_id = get_jwt_identity()
        images = get_images_by_user(current_user_id)
        
        return jsonify({'images': images})
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch images'}), 500

@app.route('/api/images/<image_id>', methods=['GET'])
@jwt_required()
def get_image(image_id):
    """Get single image"""
    try:
        current_user_id = get_jwt_identity()
        image = get_image_by_id(image_id, current_user_id)
        
        if not image:
            return jsonify({'error': 'Image not found'}), 404
        
        return jsonify({'image': image})
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch image'}), 500

@app.route('/api/images/<image_id>/process', methods=['POST'])
@jwt_required()
def process_image(image_id):
    """Process image with AI"""
    try:
        current_user_id = get_jwt_identity()
        image = get_image_by_id(image_id, current_user_id)
        
        if not image:
            return jsonify({'error': 'Image not found'}), 404
        
        data = request.get_json()
        edit_type = data.get('editType')
        intensity = data.get('intensity', 50)
        
        if not edit_type:
            return jsonify({'error': 'Edit type is required'}), 400
        
        # Get the original image path
        original_path = os.path.join(app.config['UPLOAD_FOLDER'], 
                                   os.path.basename(image['original_image_url']))
        
        if not os.path.exists(original_path):
            return jsonify({'error': 'Original image file not found'}), 404
        
        def process_async():
            """Process image asynchronously"""
            time.sleep(2)  # Simulate processing time
            
            # Process the image
            edited_filename = process_image_ai(original_path, edit_type, intensity)
            
            if edited_filename:
                # Update image record
                image['edited_image_url'] = f'/uploads/{edited_filename}'
                image['edit_type'] = edit_type
                image['intensity'] = intensity
                image['updated_at'] = datetime.utcnow().isoformat()
        
        # Start processing in background (in production, use Celery or similar)
        thread = threading.Thread(target=process_async)
        thread.start()
        
        # For demo purposes, we'll wait for processing to complete
        thread.join()
        
        return jsonify({
            'message': 'Image processed successfully',
            'image': image
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to process image'}), 500

@app.route('/api/images/<image_id>', methods=['DELETE'])
@jwt_required()
def delete_image(image_id):
    """Delete image"""
    try:
        current_user_id = get_jwt_identity()
        image = get_image_by_id(image_id, current_user_id)
        
        if not image:
            return jsonify({'error': 'Image not found'}), 404
        
        # Delete files from filesystem
        original_path = os.path.join(app.config['UPLOAD_FOLDER'], 
                                   os.path.basename(image['original_image_url']))
        if os.path.exists(original_path):
            os.remove(original_path)
        
        if image['edited_image_url']:
            edited_path = os.path.join(app.config['UPLOAD_FOLDER'], 
                                     os.path.basename(image['edited_image_url']))
            if os.path.exists(edited_path):
                os.remove(edited_path)
        
        # Remove from database
        delete_image_by_id(image_id, current_user_id)
        
        return jsonify({'message': 'Image deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': 'Failed to delete image'}), 500

@app.route('/api/user/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Get user statistics"""
    try:
        current_user_id = get_jwt_identity()
        images = get_images_by_user(current_user_id)
        
        total_images = len(images)
        processed_images = len([img for img in images if img['edited_image_url']])
        storage_used = total_images * 2.5  # Approximate MB
        
        return jsonify({
            'totalImages': total_images,
            'processedImages': processed_images,
            'storageUsed': round(storage_used, 1)
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch stats'}), 500

# File serving route
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Route not found'}), 404

@app.errorhandler(413)
def too_large(error):
    return jsonify({'error': 'File too large. Maximum size is 5MB.'}), 413

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting SmartPix API Server...")
    print(f"Upload folder: {app.config['UPLOAD_FOLDER']}")
    print("API endpoints available at http://localhost:5000/api")
    app.run(debug=True, host='0.0.0.0', port=5000)