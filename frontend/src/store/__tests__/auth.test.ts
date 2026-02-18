import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../auth';
import { act } from '@testing-library/react';

// Mock the API
vi.mock('@/lib/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
  },
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const { getState } = useAuthStore;
    act(() => {
      getState().logout();
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('logout clears user state', () => {
    // First set some state
    act(() => {
      useAuthStore.setState({
        user: { id: '1', email: 'test@test.com', created_at: '', preferences: null },
        token: 'test-token',
        isAuthenticated: true,
      });
    });

    // Then logout
    act(() => {
      useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setHasHydrated updates hydration state', () => {
    act(() => {
      useAuthStore.getState().setHasHydrated(true);
    });

    expect(useAuthStore.getState().hasHydrated).toBe(true);
  });

  it('checkAuth sets isLoading to false when no token', async () => {
    // Mock localStorage to return null
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    await act(async () => {
      await useAuthStore.getState().checkAuth();
    });

    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });
});

describe('UserPreferences interface', () => {
  it('accepts valid preference properties', () => {
    const preferences = {
      dietary_restrictions: ['vegetarian', 'gluten-free'],
      cuisine_preferences: ['italian', 'mexican'],
      allergies: ['peanuts'],
      default_servings: 4,
      theme: 'dark' as const,
    };

    // This test validates the interface at compile time
    act(() => {
      useAuthStore.setState({
        user: {
          id: '1',
          email: 'test@test.com',
          created_at: '2024-01-01',
          preferences,
        },
        isAuthenticated: true,
      });
    });

    const state = useAuthStore.getState();
    expect(state.user?.preferences).toEqual(preferences);
  });

  it('accepts null preferences', () => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: '1',
          email: 'test@test.com',
          created_at: '2024-01-01',
          preferences: null,
        },
      });
    });

    expect(useAuthStore.getState().user?.preferences).toBeNull();
  });
});
