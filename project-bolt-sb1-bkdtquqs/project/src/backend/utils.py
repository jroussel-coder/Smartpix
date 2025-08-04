# backend/utils.py
import os
import mimetypes
from werkzeug.utils import secure_filename
from PIL import Image
import uuid

def allowed_file(filename, allowed_extensions):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def validate_image_file(file, max_size=5*1024*1024, allowed_extensions={'png', 'jpg', 'jpeg', 'webp'}):
    """
    Validate uploaded image file
    
    Args:
        file: Uploaded file object
        max_size: Maximum file size in bytes
        allowed_extensions: Set of allowed file extensions
    
    Returns:
        dict: Validation result with 'valid' boolean and 'error' message
    """
    if not file:
        return {'valid': False, 'error': 'No file provided'}
    
    if file.filename == '':
        return {'valid': False, 'error': 'No file selected'}
    
    # Check file extension
    if not allowed_file(file.filename, allowed_extensions):
        return {
            'valid': False, 
            'error': f'Invalid file type. Allowed types: {", ".join(allowed_extensions).upper()}'
        }
    
    # Check file size (if file object has content_length)
    if hasattr(file, 'content_length') and file.content_length:
        if file.content_length > max_size:
            return {
                'valid': False, 
                'error': f'File too large. Maximum size is {max_size // (1024*1024)}MB'
            }
    
    # Additional validation: try to open as image
    try:
        # Save current position
        current_position = file.tell() if hasattr(file, 'tell') else 0
        
        # Try to open and verify it's a valid image
        img = Image.open(file)
        img.verify()
        
        # Reset file position
        if hasattr(file, 'seek'):
            file.seek(current_position)
        
        return {'valid': True, 'error': None}
    
    except Exception as e:
        return {'valid': False, 'error': 'Invalid image file'}

def generate_unique_filename(original_filename):
    """Generate a unique filename to prevent conflicts"""
    filename = secure_filename(original_filename)
    name, ext = os.path.splitext(filename)
    unique_name = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
    return unique_name

def get_file_info(file_path):
    """Get information about a file"""
    if not os.path.exists(file_path):
        return None
    
    stat = os.stat(file_path)
    mime_type, _ = mimetypes.guess_type(file_path)
    
    return {
        'size': stat.st_size,
        'mime_type': mime_type,
        'modified_time': stat.st_mtime,
        'created_time': stat.st_ctime
    }

def cleanup_temp_files(directory, max_age_hours=24):
    """Clean up temporary files older than specified hours"""
    import time
    
    if not os.path.exists(directory):
        return
    
    current_time = time.time()
    max_age_seconds = max_age_hours * 3600
    
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path):
            file_age = current_time - os.path.getmtime(file_path)
            if file_age > max_age_seconds:
                try:
                    os.remove(file_path)
                    print(f"Cleaned up old file: {filename}")
                except OSError as e:
                    print(f"Error cleaning up file {filename}: {e}")

def format_file_size(size_bytes):
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    import math
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return f"{s} {size_names[i]}"

def create_thumbnail(image_path, thumbnail_path, size=(200, 200)):
    """Create a thumbnail of an image"""
    try:
        with Image.open(image_path) as img:
            img.thumbnail(size, Image.Resampling.LANCZOS)
            img.save(thumbnail_path, "JPEG", quality=85)
            return True
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        return False

class FileManager:
    """File management utility class"""
    
    def __init__(self, upload_folder):
        self.upload_folder = upload_folder
        os.makedirs(upload_folder, exist_ok=True)
    
    def save_file(self, file, subfolder=None):
        """
        Save uploaded file with unique name
        
        Args:
            file: Uploaded file object
            subfolder: Optional subfolder name
        
        Returns:
            dict: Result with 'success', 'filename', 'path', and 'error'
        """
        try:
            # Validate file
            validation = validate_image_file(file)
            if not validation['valid']:
                return {
                    'success': False,
                    'error': validation['error']
                }
            
            # Generate unique filename
            unique_filename = generate_unique_filename(file.filename)
            
            # Determine save path
            if subfolder:
                save_dir = os.path.join(self.upload_folder, subfolder)
                os.makedirs(save_dir, exist_ok=True)
                file_path = os.path.join(save_dir, unique_filename)
                relative_path = os.path.join(subfolder, unique_filename)
            else:
                file_path = os.path.join(self.upload_folder, unique_filename)
                relative_path = unique_filename
            
            # Save file
            file.save(file_path)
            
            return {
                'success': True,
                'filename': unique_filename,
                'path': file_path,
                'relative_path': relative_path,
                'error': None
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to save file: {str(e)}'
            }
    
    def delete_file(self, file_path):
        """Delete a file"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
            return False
    
    def get_file_url(self, relative_path, base_url=''):
        """Get full URL for a file"""
        if not relative_path:
            return None
        
        if relative_path.startswith('http'):
            return relative_path
        
        # Ensure relative_path starts with /
        if not relative_path.startswith('/'):
            relative_path = '/' + relative_path
        
        return f"{base_url}/uploads{relative_path}"