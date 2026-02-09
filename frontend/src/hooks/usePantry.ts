import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pantryApi } from '@/lib/api';
import type { PantryItemUpdate } from '@/types/api';

export const usePantry = (enabled = true) => {
  return useQuery({
    queryKey: ['pantry'],
    queryFn: () => pantryApi.list(false),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddPantryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pantryApi.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
    },
  });
};

export const useUpdatePantryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PantryItemUpdate }) =>
      pantryApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
    },
  });
};

export const useDeletePantryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pantryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
    },
  });
};

export const useClearPantry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pantryApi.clear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
    },
  });
};
