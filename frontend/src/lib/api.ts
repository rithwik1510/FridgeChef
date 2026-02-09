import axios from 'axios';
import type {
  User,
  Scan,
  Recipe,
  ShoppingList,
  AuthResponse,
  Ingredient,
  ShoppingListItem,
  UserPreferences,
  PantryItem,
  PantryItemCreate,
  PantryItemUpdate,
  PantryResponse
} from '@/types/api';
import { safeLocalStorage } from '@/store/auth';
import { UPLOAD_TIMEOUT_MS, DEFAULT_PAGE_SIZE } from '@/lib/constants';

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
    const token = safeLocalStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — attempt token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, not on login/register/refresh endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const refreshToken = safeLocalStorage.getItem('refresh_token');

      if (refreshToken) {
        if (isRefreshing) {
          // Queue this request until refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const newToken = data.access_token;
          safeLocalStorage.setItem('auth_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          safeLocalStorage.removeItem('auth_token');
          safeLocalStorage.removeItem('refresh_token');
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // No refresh token — clear auth
      safeLocalStorage.removeItem('auth_token');
    }

    if (error.response?.status === 403) {
      safeLocalStorage.removeItem('auth_token');
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
      timeout: UPLOAD_TIMEOUT_MS,
    });
    return data;
  },
  list: async (limit = DEFAULT_PAGE_SIZE, offset = 0): Promise<Scan[]> => {
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
  list: async (
    favoritesOnly = false,
    limit = DEFAULT_PAGE_SIZE,
    offset = 0,
    filters?: { search?: string; difficulty?: string; max_cook_time?: number; sort_by?: string; sort_order?: string }
  ): Promise<Recipe[]> => {
    const { data } = await api.get('/recipes', {
      params: {
        favorites_only: favoritesOnly,
        limit,
        offset,
        ...filters,
      },
    });
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
  list: async (limit = DEFAULT_PAGE_SIZE, offset = 0): Promise<ShoppingList[]> => {
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

// Password Reset API
export const passwordResetApi = {
  request: async (email: string): Promise<{ message: string; reset_token: string | null }> => {
    const { data } = await api.post('/password-reset/request', { email });
    return data;
  },
  confirm: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await api.post('/password-reset/confirm', { token, new_password: newPassword });
    return data;
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

// Pantry API
export const pantryApi = {
  list: async (includeGrouped = false): Promise<PantryResponse> => {
    const { data } = await api.get('/pantry', {
      params: { include_grouped: includeGrouped },
    });
    return data;
  },
  add: async (item: PantryItemCreate): Promise<PantryItem> => {
    const { data } = await api.post('/pantry', item);
    return data;
  },
  addBulk: async (items: PantryItemCreate[]): Promise<PantryItem[]> => {
    const { data } = await api.post('/pantry/bulk', { items });
    return data;
  },
  update: async (itemId: string, updates: PantryItemUpdate): Promise<PantryItem> => {
    const { data } = await api.put(`/pantry/${itemId}`, updates);
    return data;
  },
  delete: async (itemId: string): Promise<void> => {
    await api.delete(`/pantry/${itemId}`);
  },
  clear: async (): Promise<void> => {
    await api.delete('/pantry');
  },
};
