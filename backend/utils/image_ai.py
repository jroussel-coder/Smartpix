#backedn/utils/image_ai.py
import openai
from openai import OpenAI
import requests
from PIL import Image
from io import BytesIO
import os


openai.api_key = os.getenv("OPENAI_API_KEY")

def process_image(input_path: str, output_path: str, edit_type: str, intensity: int):
    prompts = {
        "enhance": "Apply professional-grade image enhancement with advanced sharpening algorithms, noise reduction, and detail amplification. Optimize contrast, brightness, and color saturation while preserving natural skin tones and preventing over-processing artifacts.",
        "restore": "Perform comprehensive image restoration using state-of-the-art denoising, deblurring, and artifact removal techniques. Reconstruct missing details, eliminate compression artifacts, reduce motion blur, and restore original image quality with photorealistic precision.",
        "retouch": "Execute professional portrait retouching with advanced blemish removal, skin smoothing, and complexion enhancement. Eliminate imperfections, reduce wrinkles, brighten eyes, whiten teeth, and perfect skin texture while maintaining natural appearance and avoiding over-smoothing.",
        "style": "Transform the image into a masterpiece oil painting with rich textures, vibrant brush strokes, and classical artistic techniques. Apply layered paint effects, canvas texture, and traditional color palettes while preserving subject recognition and artistic authenticity.",
        "background": "Perform precision background removal using advanced AI segmentation with sub-pixel accuracy. Create clean transparent PNG output with perfect edge detection, hair detail preservation, and anti-aliasing for professional compositing results."
    }

    if edit_type not in prompts:
        raise ValueError("Unsupported edit_type")

    prompt = prompts[edit_type]

    client = OpenAI()

    response = client.images.create_variation(
        image=open(input_path, "rb"),
        n=1,
        size="512x512"
    )
    image_url = response.data[0].url
    img_data = requests.get(image_url).content

    with open(output_path, "wb") as f:
        f.write(img_data)

    print("Image saved to:", output_path)
    print("Generated image URL:", image_url)