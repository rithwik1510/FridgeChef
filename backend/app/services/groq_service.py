import json
import base64
from pathlib import Path
from groq import Groq
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# Verify API key is set
if not settings.GROQ_API_KEY:
    logger.warning("GROQ_API_KEY is not set! Image scanning will fail.")
else:
    logger.info(f"Groq API key configured (length: {len(settings.GROQ_API_KEY)})")

# Initialize Groq client
client = None
if settings.GROQ_API_KEY:
    client = Groq(api_key=settings.GROQ_API_KEY)

def encode_image(image_path: Path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def detect_ingredients_from_image(image_path: str) -> list[dict]:
    """
    Detect ingredients from a fridge/pantry image using Llama 4 Scout Vision on Groq.
    """
    if not settings.GROQ_API_KEY:
        raise Exception("GROQ_API_KEY is not set. Please add it to your .env file.")

    try:
        full_path = Path(settings.UPLOAD_DIR) / image_path
        base64_image = encode_image(full_path)

        # Using meta-llama/llama-4-scout-17b-16e-instruct (Production Vision Model)
        model_name = "meta-llama/llama-4-scout-17b-16e-instruct"
        
        prompt = """
        Look at this refrigerator/pantry photo carefully. List all visible food items and ingredients.

        Return your response as a JSON array with this exact format:
        [
            {"name": "eggs", "quantity": "6", "confidence": 0.95},
            {"name": "cheddar cheese", "quantity": "1 block", "confidence": 0.90},
            {"name": "milk", "quantity": "1 carton", "confidence": 0.85}
        ]

        Guidelines:
        - Only include items you're reasonably confident about (confidence > 0.60)
        - Be specific: "cheddar cheese" not just "cheese"
        - Estimate quantities when visible
        - Confidence should be between 0 and 1
        - Return ONLY the JSON array, no other text or explanation.
        """

        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            temperature=0.1,
            max_tokens=1024,
            top_p=1,
            stream=False,
            response_format={"type": "json_object"}
        )

        response_text = completion.choices[0].message.content.strip()
        logger.debug(f"Groq raw response: {response_text}")

        data = json.loads(response_text)
        
        if isinstance(data, dict):
            for key in data:
                if isinstance(data[key], list):
                    ingredients = data[key]
                    break
            else:
                ingredients = []
        else:
            ingredients = data

        cleaned_ingredients = []
        for item in ingredients:
            if isinstance(item, dict) and "name" in item:
                cleaned_ingredients.append({
                    "name": item.get("name", "").strip(),
                    "quantity": str(item.get("quantity", "some")).strip(),
                    "confidence": float(item.get("confidence", 0.75))
                })

        return cleaned_ingredients

    except Exception as e:
        logger.error(f"Error in Groq vision detection: {e}")
        raise Exception(f"Failed to detect ingredients: {str(e)}")

def merge_ingredients(scan_ingredients: list[dict], pantry_ingredients: list[dict]) -> list[dict]:
    merged = {}
    for ing in pantry_ingredients:
        name_lower = ing.get('name', '').lower().strip()
        if name_lower:
            merged[name_lower] = {
                'name': ing.get('name', '').strip(),
                'quantity': ing.get('quantity', 'some'),
                'confidence': 1.0,
                'source': 'pantry'
            }
    for ing in scan_ingredients:
        name_lower = ing.get('name', '').lower().strip()
        if name_lower:
            merged[name_lower] = {
                'name': ing.get('name', '').strip(),
                'quantity': ing.get('quantity', 'some'),
                'confidence': ing.get('confidence', 0.8),
                'source': 'scan'
            }
    return list(merged.values())

def generate_recipes(
    available_ingredients: list[dict],
    preferences: dict | None = None,
    count: int = 3,
    pantry_ingredients: list[dict] | None = None
) -> list[dict]:
    try:
        all_ingredients = available_ingredients
        if pantry_ingredients:
            all_ingredients = merge_ingredients(available_ingredients, pantry_ingredients)

        ingredients_list = [f"{ing['name']} ({ing.get('quantity', 'some')})" for ing in all_ingredients]
        ingredients_str = ", ".join(ingredients_list)

        prefs_str = ""
        if preferences:
            dietary = preferences.get("dietary", [])
            allergies = preferences.get("allergies", [])
            cuisines = preferences.get("cuisines", [])
            skill_level = preferences.get("skill_level", "intermediate")
            max_cook_time = preferences.get("max_cook_time", 60)
            servings = preferences.get("servings", 2)
            
            prefs_str = f"""
            User Preferences:
            - Dietary: {', '.join(dietary) if dietary else 'None'}
            - Allergies (AVOID): {', '.join(allergies) if allergies else 'None'}
            - Cuisine: {', '.join(cuisines) if cuisines else 'Any'}
            - Skill: {skill_level}
            - Time: {max_cook_time} mins
            - Servings: {servings}
            """

        prompt = f"""
        Create {count} diverse recipes using: {ingredients_str}.
        {prefs_str}

        Return as a JSON array of objects with this format:
        {{
            "title": "Recipe Name",
            "description": "Appetizing description",
            "cook_time": 25,
            "difficulty": "easy",
            "servings": 4,
            "ingredients": [
                {{"name": "ingredient", "amount": "quantity", "available": true}}
            ],
            "instructions": ["Step 1", "Step 2"]
        }}
        Return ONLY the JSON array.
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        response_text = completion.choices[0].message.content.strip()
        data = json.loads(response_text)
        
        recipes = []
        if isinstance(data, list):
            recipes = data
        elif isinstance(data, dict):
            for key in data:
                if isinstance(data[key], list):
                    recipes = data[key]
                    break

        return recipes[:count]

    except Exception as e:
        logger.error(f"Error generating recipes with Groq: {e}")
        raise Exception(f"Failed to generate recipes: {str(e)}")
