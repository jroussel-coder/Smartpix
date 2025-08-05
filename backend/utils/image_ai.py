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
        "enhance": "Sharpen and enhance this image to improve clarity and detail.",
        "restore": "Restore and clean up this image to fix any damage or blur.",
        "retouch": "Retouch the image to remove blemishes and imperfections.",
        "style": "Apply an oil painting style to this image.",
        "background": "Remove the background from this image and make it transparent."
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