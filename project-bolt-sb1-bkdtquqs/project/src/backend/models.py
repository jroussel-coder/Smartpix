# backend/models.py
from datetime import datetime
import uuid

class User:
    """User model"""
    
    def __init__(self, email, password_hash):
        self.id = str(uuid.uuid4())
        self.email = email
        self.password = password_hash
        self.created_at = datetime.utcnow().isoformat()
    
    def to_dict(self, include_password=False):
        """Convert user to dictionary"""
        data = {
            'id': self.id,
            'email': self.email,
            'created_at': self.created_at
        }
        if include_password:
            data['password'] = self.password
        return data
    
    @classmethod
    def from_dict(cls, data):
        """Create user from dictionary"""
        user = cls.__new__(cls)
        user.id = data['id']
        user.email = data['email']
        user.password = data['password']
        user.created_at = data['created_at']
        return user

class Image:
    """Image model"""
    
    def __init__(self, user_id, name, original_image_url):
        self.id = str(uuid.uuid4())
        self.user_id = user_id
        self.name = name
        self.original_image_url = original_image_url
        self.edited_image_url = None
        self.edit_type = None
        self.intensity = None
        self.created_at = datetime.utcnow().isoformat()
        self.updated_at = datetime.utcnow().isoformat()
    
    def to_dict(self):
        """Convert image to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'original_image_url': self.original_image_url,
            'edited_image_url': self.edited_image_url,
            'edit_type': self.edit_type,
            'intensity': self.intensity,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create image from dictionary"""
        image = cls.__new__(cls)
        image.id = data['id']
        image.user_id = data['user_id']
        image.name = data['name']
        image.original_image_url = data['original_image_url']
        image.edited_image_url = data.get('edited_image_url')
        image.edit_type = data.get('edit_type')
        image.intensity = data.get('intensity')
        image.created_at = data['created_at']
        image.updated_at = data['updated_at']
        return image
    
    def update_edited(self, edited_image_url, edit_type, intensity):
        """Update image with edited version"""
        self.edited_image_url = edited_image_url
        self.edit_type = edit_type
        self.intensity = intensity
        self.updated_at = datetime.utcnow().isoformat()

# Database operations (In-memory storage)
class Database:
    """Simple in-memory database"""
    
    def __init__(self):
        self.users = []
        self.images = []
    
    # User operations
    def create_user(self, email, password_hash):
        """Create a new user"""
        user = User(email, password_hash)
        self.users.append(user)
        return user
    
    def get_user_by_email(self, email):
        """Get user by email"""
        return next((user for user in self.users if user.email == email), None)
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        return next((user for user in self.users if user.id == user_id), None)
    
    # Image operations
    def create_image(self, user_id, name, original_image_url):
        """Create a new image"""
        image = Image(user_id, name, original_image_url)
        self.images.append(image)
        return image
    
    def get_image_by_id(self, image_id, user_id=None):
        """Get image by ID, optionally filtered by user"""
        for image in self.images:
            if image.id == image_id:
                if user_id is None or image.user_id == user_id:
                    return image
        return None
    
    def get_images_by_user(self, user_id):
        """Get all images for a user"""
        return [image for image in self.images if image.user_id == user_id]
    
    def update_image(self, image_id, user_id, edited_image_url, edit_type, intensity):
        """Update image with edited version"""
        image = self.get_image_by_id(image_id, user_id)
        if image:
            image.update_edited(edited_image_url, edit_type, intensity)
            return image
        return None
    
    def delete_image(self, image_id, user_id):
        """Delete image by ID for a specific user"""
        self.images = [img for img in self.images if not (img.id == image_id and img.user_id == user_id)]
    
    def get_user_stats(self, user_id):
        """Get user statistics"""
        images = self.get_images_by_user(user_id)
        total_images = len(images)
        processed_images = len([img for img in images if img.edited_image_url])
        storage_used = total_images * 2.5  # Approximate MB
        
        return {
            'totalImages': total_images,
            'processedImages': processed_images,
            'storageUsed': round(storage_used, 1)
        }

# Global database instance
db = Database()