# backend/services/ai_service.py
import os
import uuid
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import numpy as np

class AIImageProcessor:
    """AI Image Processing Service"""
    
    def __init__(self, upload_folder):
        self.upload_folder = upload_folder
    
    def process_image(self, image_path, edit_type, intensity=50):
        """
        Process image with AI-like enhancements
        
        Args:
            image_path (str): Path to the original image
            edit_type (str): Type of editing to apply
            intensity (int): Intensity of the effect (0-100)
        
        Returns:
            str: Filename of the processed image or None if failed
        """
        try:
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Apply processing based on edit type
                processed_img = self._apply_processing(img, edit_type, intensity)
                
                if processed_img is None:
                    return None
                
                # Generate output filename
                base_name = os.path.splitext(os.path.basename(image_path))[0]
                output_filename = f"{base_name}_edited_{edit_type}_{uuid.uuid4().hex[:8]}.jpg"
                output_path = os.path.join(self.upload_folder, output_filename)
                
                # Save the processed image
                processed_img.save(output_path, 'JPEG', quality=95, optimize=True)
                
                return output_filename
                
        except Exception as e:
            print(f"Error processing image: {str(e)}")
            return None
    
    def _apply_processing(self, img, edit_type, intensity):
        """Apply specific processing based on edit type"""
        
        # Normalize intensity to a usable range
        factor = intensity / 100.0
        
        if edit_type == 'enhance':
            return self._auto_enhance(img, factor)
        elif edit_type == 'style':
            return self._style_transfer(img, factor)
        elif edit_type == 'colorize':
            return self._colorize(img, factor)
        elif edit_type == 'restore':
            return self._restore(img, factor)
        elif edit_type == 'retouch':
            return self._retouch(img, factor)
        elif edit_type == 'background':
            return self._background_effect(img, factor)
        else:
            return img
    
    def _auto_enhance(self, img, factor):
        """Auto enhance image with improved contrast, brightness, and sharpness"""
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1 + (factor * 0.5))
        
        # Enhance brightness slightly
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1 + (factor * 0.2))
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1 + (factor * 0.7))
        
        # Enhance color saturation
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1 + (factor * 0.3))
        
        return img
    
    def _style_transfer(self, img, factor):
        """Apply artistic style effects"""
        if factor > 0.7:
            # Strong artistic effect
            img = img.filter(ImageFilter.EDGE_ENHANCE_MORE)
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1 + factor)
        elif factor > 0.4:
            # Medium effect
            img = img.filter(ImageFilter.EDGE_ENHANCE)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1 + (factor * 0.5))
        else:
            # Subtle effect
            img = img.filter(ImageFilter.SMOOTH_MORE)
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1 + (factor * 0.5))
        
        return img
    
    def _colorize(self, img, factor):
        """Enhance colors and add vibrant tones"""
        # Enhance color saturation
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1 + (factor * 1.5))
        
        # Slightly increase contrast for more vivid colors
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1 + (factor * 0.3))
        
        # Add slight brightness for more vibrant look
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1 + (factor * 0.1))
        
        return img
    
    def _restore(self, img, factor):
        """Restore old or damaged photos"""
        # Reduce noise with median filter
        img = img.filter(ImageFilter.MedianFilter(size=3))
        
        # Enhance sharpness to restore details
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1 + (factor * 0.8))
        
        # Improve contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1 + (factor * 0.4))
        
        # Apply unsharp mask for better detail
        if factor > 0.5:
            img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
        
        return img
    
    def _retouch(self, img, factor):
        """Retouch and smooth imperfections"""
        # Apply blur for smoothing
        blur_radius = factor * 2
        img = img.filter(ImageFilter.GaussianBlur(radius=blur_radius))
        
        # Enhance brightness slightly
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1 + (factor * 0.1))
        
        # Reduce contrast slightly for softer look
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1 - (factor * 0.1))
        
        return img
    
    def _background_effect(self, img, factor):
        """Apply background effects (simplified background blur)"""
        # Create a simple depth-of-field effect by blurring the image
        # In a real implementation, this would use AI to detect foreground/background
        
        # Apply gaussian blur with varying intensity
        blur_radius = factor * 5
        blurred = img.filter(ImageFilter.GaussianBlur(radius=blur_radius))
        
        # Create a simple mask (center focus)
        width, height = img.size
        mask = Image.new('L', (width, height), 0)
        
        # Create circular gradient mask for center focus
        center_x, center_y = width // 2, height // 2
        max_radius = min(width, height) // 3
        
        for y in range(height):
            for x in range(width):
                distance = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
                if distance < max_radius:
                    alpha = int(255 * (distance / max_radius))
                else:
                    alpha = 255
                mask.putpixel((x, y), alpha)
        
        # Composite original and blurred image using mask
        result = Image.composite(blurred, img, mask)
        return result

class MockAIService:
    """Mock AI service for demonstration purposes"""
    
    def __init__(self):
        self.processor = None
    
    def set_processor(self, processor):
        """Set the image processor"""
        self.processor = processor
    
    async def enhance_image(self, image_path, options):
        """Mock AI enhancement service"""
        if not self.processor:
            raise Exception("Image processor not initialized")
        
        edit_type = options.get('type', 'enhance')
        intensity = options.get('intensity', 50)
        
        return self.processor.process_image(image_path, edit_type, intensity)
    
    async def style_transfer(self, image_path, style, intensity=50):
        """Mock style transfer service"""
        if not self.processor:
            raise Exception("Image processor not initialized")
        
        return self.processor.process_image(image_path, 'style', intensity)
    
    async def colorize_image(self, image_path, intensity=50):
        """Mock colorization service"""
        if not self.processor:
            raise Exception("Image processor not initialized")
        
        return self.processor.process_image(image_path, 'colorize', intensity)
    
    async def restore_image(self, image_path, intensity=50):
        """Mock restoration service"""
        if not self.processor:
            raise Exception("Image processor not initialized")
        
        return self.processor.process_image(image_path, 'restore', intensity)

# Example integration with external AI services
class ExternalAIService:
    """Integration with external AI services like OpenAI, Replicate, etc."""
    
    def __init__(self, api_key=None):
        self.api_key = api_key
    
    async def call_openai_dalle(self, prompt, image_path=None):
        """Call OpenAI DALL-E API for image generation/editing"""
        # This would integrate with OpenAI's API
        # import openai
        # openai.api_key = self.api_key
        # response = await openai.Image.create_edit(...)
        pass
    
    async def call_stability_ai(self, image_path, prompt):
        """Call Stability AI API for image-to-image transformations"""
        # This would integrate with Stability AI's API
        # import requests
        # response = requests.post("https://api.stability.ai/v1/generation/...", ...)
        pass
    
    async def call_replicate(self, model, inputs):
        """Call Replicate API for various AI models"""
        # This would integrate with Replicate's API
        # import replicate
        # output = replicate.run(model, input=inputs)
        pass