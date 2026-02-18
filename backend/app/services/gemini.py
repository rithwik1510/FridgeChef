import json
from pathlib import Path

import google.generativeai as genai

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# Verify API key is set
if not settings.GOOGLE_API_KEY:
    logger.warning("GOOGLE_API_KEY is not set! Image scanning will fail.")
else:
    logger.info(f"API key configured (length: {len(settings.GOOGLE_API_KEY)})")

# Configure Gemini
genai.configure(api_key=settings.GOOGLE_API_KEY)


import mimetypes


def detect_ingredients_from_image(image_path: str) -> list[dict]:
    """
    Detect ingredients from a fridge/pantry image using Gemini Vision.
    Returns a list of detected ingredients with confidence scores.
    """
    # Check if API key is configured
    if not settings.GOOGLE_API_KEY:
        raise Exception("GOOGLE_API_KEY is not set. Please add it to your .env file.")

    try:
        # Load the image
        full_path = Path(settings.UPLOAD_DIR) / image_path
        logger.info(f"Loading image from: {full_path}")

        # Determine mime type
        mime_type, _ = mimetypes.guess_type(full_path)
        if not mime_type:
            ext = full_path.suffix.lower()
            if ext in ['.jpg', '.jpeg']:
                mime_type = 'image/jpeg'
            elif ext == '.png':
                mime_type = 'image/png'
            elif ext == '.webp':
                mime_type = 'image/webp'
            elif ext == '.heic':
                mime_type = 'image/heic'
            else:
                mime_type = "image/jpeg"  # Default
        logger.info(f"Detected mime type: {mime_type}")

        with open(full_path, "rb") as image_file:
            image_data = image_file.read()
        logger.info(f"Image loaded, size: {len(image_data)} bytes")

        # Create the model - using gemini-2.5-flash (current stable free tier model)
        model_name = 'gemini-2.5-flash'
        logger.info(f"Creating model: {model_name}")
        model = genai.GenerativeModel(model_name)

        # Create the prompt
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
        - Be specific: "cheddar cheese" not just "cheese", "red bell pepper" not just "pepper"
        - Estimate quantities when visible (e.g., "6 eggs", "1 bottle", "half head of lettuce")
        - Use "some" or "portion" if quantity is unclear
        - Include fresh produce, dairy, meats, condiments, and beverages
        - Confidence should be between 0 and 1
        - Return ONLY the JSON array, no other text
        """

        # Generate content
        logger.info("Sending request to Gemini API...")
        response = model.generate_content([prompt, {"mime_type": mime_type, "data": image_data}])
        logger.info("Response received from Gemini API")

        # --- DEBUG LOGGING ---
        logger.debug(f"Response feedback: {response.prompt_feedback}")
        try:
            logger.debug(f"Raw text: {response.text}")
        except Exception as e:
            logger.debug(f"Could not access response.text: {e}")
            # Check for safety blocking
            if hasattr(response, 'candidates'):
                 logger.debug(f"Candidates: {response.candidates}")
        # ---------------------

        # Parse the response
        try:
            # Extract JSON from response
            response_text = response.text.strip()

            # Clean markdown code blocks if present
            if "```json" in response_text:
                response_text = response_text.replace("```json", "").replace("```", "")
            elif "```" in response_text:
                response_text = response_text.replace("```", "")

            response_text = response_text.strip()
            logger.debug(f"Raw response length: {len(response_text)}")

            # Robust JSON extraction
            try:
                # Find the start and end of the JSON array
                start_idx = response_text.find('[')
                end_idx = response_text.rfind(']')

                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    response_text = response_text[start_idx : end_idx + 1]
                    logger.debug("Extracted JSON segment")
                else:
                    logger.warning("Could not find JSON array brackets in response")
            except Exception as extract_err:
                logger.error(f"Error extracting JSON substring: {extract_err}")

            ingredients = json.loads(response_text)

            # Validate and clean the data
            cleaned_ingredients = []
            for item in ingredients:
                if isinstance(item, dict) and "name" in item:
                    cleaned_ingredients.append({
                        "name": item.get("name", "").strip(),
                        "quantity": item.get("quantity", "some").strip(),
                        "confidence": float(item.get("confidence", 0.75))
                    })

            logger.info(f"Successfully parsed {len(cleaned_ingredients)} ingredients")

            if not cleaned_ingredients:
                raise Exception(f"Gemini returned no ingredients. Raw text: {response_text[:200]}")

            return cleaned_ingredients

        except json.JSONDecodeError as e:
            logger.error(f"Error parsing response as JSON: {e}")
            logger.error(f"Raw response text: {response.text[:500]}...")
            # Return empty list if parsing fails
            return []

    except Exception as e:
        logger.error(f"Error in detect_ingredients_from_image: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise Exception(f"Failed to detect ingredients: {str(e)}") from e


def merge_ingredients(scan_ingredients: list[dict], pantry_ingredients: list[dict]) -> list[dict]:
    """
    Merge scan ingredients with pantry ingredients, avoiding duplicates.
    Scan ingredients take priority for quantities.
    """
    merged = {}

    # First add pantry ingredients
    for ing in pantry_ingredients:
        name_lower = ing.get('name', '').lower().strip()
        if name_lower:
            merged[name_lower] = {
                'name': ing.get('name', '').strip(),
                'quantity': ing.get('quantity', 'some'),
                'confidence': 1.0,  # Pantry items are confirmed
                'source': 'pantry'
            }

    # Then add/override with scan ingredients
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
    """
    Generate recipe suggestions based on available ingredients and user preferences.
    Returns a list of recipe objects.

    Args:
        available_ingredients: Ingredients from the current scan
        preferences: User preferences (dietary, allergies, cuisines, etc.)
        count: Number of recipes to generate
        pantry_ingredients: Additional ingredients from user's pantry
    """
    try:
        # Create the model
        model = genai.GenerativeModel('gemini-2.5-flash')

        # Merge scan ingredients with pantry ingredients
        all_ingredients = available_ingredients
        if pantry_ingredients:
            all_ingredients = merge_ingredients(available_ingredients, pantry_ingredients)
            logger.info(f"Merged {len(available_ingredients)} scan + {len(pantry_ingredients)} pantry = {len(all_ingredients)} total ingredients")

        # Format ingredients list
        ingredients_list = [f"{ing['name']} ({ing.get('quantity', 'some')})" for ing in all_ingredients]
        ingredients_str = ", ".join(ingredients_list)

        # Format preferences
        prefs_str = ""
        has_cuisine_preference = False
        if preferences:
            dietary = preferences.get("dietary", [])
            allergies = preferences.get("allergies", [])
            cuisines = preferences.get("cuisines", [])
            skill_level = preferences.get("skill_level", "intermediate")
            max_cook_time = preferences.get("max_cook_time", 60)
            servings = preferences.get("servings", 2)

            has_cuisine_preference = bool(cuisines and len(cuisines) > 0)

            # Build cuisine instruction
            if has_cuisine_preference:
                cuisine_list = ', '.join(cuisines)
                cuisine_instruction = f"""STRICTLY {cuisine_list} cuisine ONLY.
CRITICAL: You MUST generate AUTHENTIC, TRADITIONAL {cuisine_list} dishes:
- Use traditional recipe names (e.g., for Indian: "Aloo Gobi", "Dal Tadka", "Paneer Butter Masala")
- These must be real dishes that people from {cuisine_list} would recognize
- Do NOT create fusion or "inspired by" dishes
- Do NOT add "{cuisine_list}-style" or "{cuisine_list}-inspired" to non-authentic dishes"""
            else:
                cuisine_instruction = "Any cuisine"

            prefs_str = f"""
User Preferences:
- Dietary restrictions: {', '.join(dietary) if dietary else 'None'}
- Allergies (MUST AVOID): {', '.join(allergies) if allergies else 'None'}
- Cuisine: {cuisine_instruction}
- Skill level: {skill_level}
- Maximum cooking time: {max_cook_time} minutes
- Servings needed: {servings}
"""

        # Build variety guideline based on cuisine preference
        variety_guideline = "ALL recipes must be authentic dishes from the specified cuisine - no fusion" if has_cuisine_preference else "Include variety in meal types and cuisines"

        # Create the prompt
        prompt = f"""
Create {count} diverse recipe suggestions using these available ingredients:
{ingredients_str}

{prefs_str}

For each recipe, provide a JSON object with this exact format:
{{
    "title": "Recipe Name",
    "description": "One-line appetizing description (max 100 characters)",
    "cook_time": 25,
    "difficulty": "easy",
    "servings": 4,
    "ingredients": [
        {{"name": "eggs", "amount": "4", "available": true}},
        {{"name": "parmesan cheese", "amount": "50g", "available": false}}
    ],
    "instructions": [
        "Step 1 description...",
        "Step 2 description...",
        "Step 3 description..."
    ]
}}

Guidelines:
- Prioritize recipes where the user has MOST of the ingredients
- Mark each ingredient as "available": true if the user has it, false otherwise
- {variety_guideline}
- Keep recipes practical for home cooking
- STRICTLY respect dietary restrictions and allergies - never include allergens
- Consider the user's skill level and time constraints
- Use clear, step-by-step instructions
- Difficulty levels: "easy", "medium", "hard"
- Return ONLY a JSON array of {count} recipe objects, no other text

Return format: [recipe1, recipe2, recipe3]
"""

        # Generate content
        response = model.generate_content(prompt)

        # Parse the response
        try:
            response_text = response.text.strip()

            # Robust JSON extraction
            try:
                # Find the start and end of the JSON array
                start_idx = response_text.find('[')
                end_idx = response_text.rfind(']')

                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    response_text = response_text[start_idx : end_idx + 1]
                else:
                    logger.warning("Could not find JSON array brackets in recipe response")
            except Exception as extract_err:
                logger.error(f"Error extracting JSON substring: {extract_err}")

            recipes = json.loads(response_text)

            # Validate recipes
            if not isinstance(recipes, list):
                recipes = [recipes]

            return recipes[:count]

        except json.JSONDecodeError as e:
            logger.error(f"Error parsing Gemini response: {e}")
            logger.debug(f"Response text: {response.text}")
            return []

    except Exception as e:
        logger.error(f"Error generating recipes: {e}")
        raise Exception(f"Failed to generate recipes: {str(e)}") from e
