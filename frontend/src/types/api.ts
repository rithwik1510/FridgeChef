// User types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  dietary: string[];
  allergies: string[];
  cuisines: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  max_cook_time: number;
  servings: number;
}

// Scan types
export interface Ingredient {
  name: string;
  quantity: string;
  confidence: number;
}

export interface Scan {
  id: string;
  user_id: string;
  image_path: string;
  ingredients: Ingredient[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

// Recipe types
export interface Recipe {
  id: string;
  user_id: string;
  scan_id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine_type: string;
  dietary_info: string[];
  is_favorite: boolean;
  times_made: number;
  created_at: string;
}

// Shopping list types
export interface ShoppingListItem {
  name: string;
  quantity: string;
  checked: boolean;
  category?: string;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  items: ShoppingListItem[];
  created_at: string;
  updated_at: string;
}

// API response types
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
