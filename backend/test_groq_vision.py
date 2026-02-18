import base64
import os
import json
from groq import Groq
from pathlib import Path

# Static test with the provided key
api_key = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=api_key)

# Get the latest image from uploads
upload_dir = Path("/home/rishi/Downloads/FridgeChef-main/backend/uploads")
images = list(upload_dir.glob("*.jpeg")) + list(upload_dir.glob("*.png"))
if not images:
    print("Error: No images found in uploads directory.")
    exit(1)

latest_image = max(images, key=os.path.getmtime)
print(f"Testing with image: {latest_image}")

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

try:
    base64_image = encode_image(latest_image)
    model_name = "meta-llama/llama-4-scout-17b-16e-instruct"
    
    completion = client.chat.completions.create(
        model=model_name,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "List food items in this image as a JSON array: [{\"name\": \"...\", \"quantity\": \"...\", \"confidence\": ...}]"},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                        },
                    },
                ],
            }
        ],
        response_format={"type": "json_object"}
    )
    print("API Success!")
    print(completion.choices[0].message.content)
except Exception as e:
    print(f"API Failed: {e}")
