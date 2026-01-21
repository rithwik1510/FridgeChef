import axios from 'axios';
import type { 
  User, 
  Scan, 
  Recipe, 
  ShoppingList, 
  AuthResponse, 
  Ingredient, 
  ShoppingListItem,
  UserPreferences
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear token on auth errors - pages will handle redirect if needed
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', { email, password, name });
    return data;
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// Scans API
export const scansApi = {
  create: async (file: File): Promise<Scan> => {
    const formData = new FormData();
    formData.append('file', file);
    // Don't set Content-Type header - let Axios set it automatically with boundary
    const { data } = await api.post('/scans', formData, {
      headers: {
        'Content-Type': undefined,
      },
      timeout: 60000, // 60 second timeout for large uploads
    });
    return data;
  },
  list: async (limit = 20, offset = 0): Promise<Scan[]> => {
    const { data } = await api.get('/scans', { params: { limit, offset } });
    return data;
  },
  get: async (scanId: string): Promise<Scan> => {
    const { data } = await api.get(`/scans/${scanId}`);
    return data;
  },
  update: async (scanId: string, ingredients: Ingredient[]): Promise<Scan> => {
    const { data } = await api.put(`/scans/${scanId}`, { ingredients });
    return data;
  },
};

// Recipes API
export const recipesApi = {
  generate: async (scanId: string, count = 3): Promise<Recipe[]> => {
    const { data } = await api.post('/recipes/generate', { scan_id: scanId, count });
    return data;
  },
  list: async (favoritesOnly = false, limit = 20, offset = 0): Promise<Recipe[]> => {
    const { data } = await api.get('/recipes', { params: { favorites_only: favoritesOnly, limit, offset } });
    return data;
  },
  get: async (recipeId: string): Promise<Recipe> => {
    const { data } = await api.get(`/recipes/${recipeId}`);
    return data;
  },
  toggleFavorite: async (recipeId: string): Promise<Recipe> => {
    const { data } = await api.patch(`/recipes/${recipeId}/favorite`);
    return data;
  },
  incrementMade: async (recipeId: string): Promise<Recipe> => {
    const { data } = await api.patch(`/recipes/${recipeId}/made`);
    return data;
  },
  delete: async (recipeId: string) => {
    await api.delete(`/recipes/${recipeId}`);
  },
};

// Shopping Lists API
export const listsApi = {
  create: async (name: string, recipeId?: string, items?: ShoppingListItem[]): Promise<ShoppingList> => {
    const { data } = await api.post('/lists', { name, recipe_id: recipeId, items: items || [] });
    return data;
  },
  list: async (limit = 20, offset = 0): Promise<ShoppingList[]> => {
    const { data } = await api.get('/lists', { params: { limit, offset } });
    return data;
  },
  get: async (listId: string): Promise<ShoppingList> => {
    const { data } = await api.get(`/lists/${listId}`);
    return data;
  },
  update: async (listId: string, items: ShoppingListItem[]): Promise<ShoppingList> => {
    const { data } = await api.patch(`/lists/${listId}`, { items });
    return data;
  },
  delete: async (listId: string) => {
    await api.delete(`/lists/${listId}`);
  },
};

// User API
export const userApi = {
  getPreferences: async (): Promise<UserPreferences> => {
    const { data } = await api.get('/user/preferences');
    return data;
  },
  updatePreferences: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
    const { data } = await api.put('/user/preferences', preferences);
    return data;
  },
};