import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePantry } from '../usePantry';

const mockList = vi.fn();

vi.mock('@/lib/api', () => ({
  pantryApi: {
    list: (...args: unknown[]) => mockList(...args),
    add: vi.fn(),
    addBulk: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('usePantry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch when disabled', async () => {
    const wrapper = createWrapper();
    renderHook(() => usePantry(false), { wrapper });

    await waitFor(() => {
      expect(mockList).not.toHaveBeenCalled();
    });
  });

  it('fetches lightweight pantry payload by default', async () => {
    mockList.mockResolvedValue({
      items: [],
      grouped: {},
      categories: [],
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePantry(true), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockList).toHaveBeenCalledWith(false);
  });
});
