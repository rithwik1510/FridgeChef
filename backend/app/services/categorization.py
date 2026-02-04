def categorize_ingredient(name: str) -> str:
    """Categorize an ingredient based on its name."""
    name_lower = name.lower()

    # Produce
    produce = ["lettuce", "tomato", "onion", "garlic", "pepper", "carrot", "celery", "spinach",
               "broccoli", "cauliflower", "cucumber", "zucchini", "potato", "apple", "banana",
               "lemon", "lime", "orange", "berry", "herb", "cilantro", "parsley", "basil",
               "mushroom", "cabbage", "kale", "avocado", "ginger", "corn", "peas", "beans",
               "eggplant", "squash", "radish", "beet", "turnip", "asparagus", "artichoke"]
    if any(item in name_lower for item in produce):
        return "Produce"

    # Dairy & Eggs
    dairy = ["milk", "cheese", "yogurt", "butter", "cream", "egg", "sour cream", "cottage",
             "cheddar", "mozzarella", "parmesan", "ricotta", "feta"]
    if any(item in name_lower for item in dairy):
        return "Dairy & Eggs"

    # Meat & Seafood
    meat = ["chicken", "beef", "pork", "fish", "salmon", "turkey", "bacon", "sausage", "meat",
            "shrimp", "prawn", "tuna", "cod", "lamb", "duck", "ham", "steak", "ground", "crab",
            "lobster", "scallop", "mussel", "clam", "anchovy"]
    if any(item in name_lower for item in meat):
        return "Meat & Seafood"

    # Spices & Seasonings
    spices = ["cumin", "paprika", "oregano", "thyme", "rosemary", "cinnamon", "nutmeg",
              "turmeric", "coriander", "cayenne", "chili", "bay leaf", "sage", "dill",
              "mint", "clove", "cardamom", "fennel", "mustard seed", "pepper flake"]
    if any(item in name_lower for item in spices):
        return "Spices & Seasonings"

    # Condiments & Sauces
    condiments = ["ketchup", "mustard", "mayonnaise", "soy sauce", "hot sauce", "salsa",
                  "bbq sauce", "worcestershire", "teriyaki", "sriracha", "tahini",
                  "hoisin", "fish sauce", "oyster sauce", "honey", "maple syrup", "jam",
                  "jelly", "peanut butter", "nutella", "ranch", "dressing"]
    if any(item in name_lower for item in condiments):
        return "Condiments & Sauces"

    # Grains & Pasta
    grains = ["rice", "pasta", "noodle", "bread", "flour", "oat", "quinoa", "couscous",
              "barley", "bulgur", "cereal", "tortilla", "pita", "bagel", "roll", "bun",
              "cracker", "breadcrumb"]
    if any(item in name_lower for item in grains):
        return "Grains & Pasta"

    # Frozen
    frozen = ["frozen", "ice cream", "popsicle", "ice"]
    if any(item in name_lower for item in frozen):
        return "Frozen"

    # Beverages
    beverages = ["juice", "soda", "coffee", "tea", "water", "wine", "beer", "milk",
                 "smoothie", "lemonade", "cola"]
    if any(item in name_lower for item in beverages):
        return "Beverages"

    # Pantry Staples
    pantry = ["sugar", "salt", "oil", "vinegar", "stock", "broth", "can", "bean", "lentil",
              "chickpea", "coconut milk", "tomato paste", "tomato sauce", "olive oil",
              "vegetable oil", "sesame oil", "cornstarch", "baking", "yeast", "vanilla",
              "cocoa", "chocolate", "nut", "almond", "walnut", "cashew", "seed"]
    if any(item in name_lower for item in pantry):
        return "Pantry Staples"

    return "Other"
