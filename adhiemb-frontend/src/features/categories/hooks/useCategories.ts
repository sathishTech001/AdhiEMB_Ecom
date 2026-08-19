import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories.api';
import { CreateCategoryData, UpdateCategoryData } from '../types/category.types';
import { toast } from 'react-hot-toast';

export const CATEGORIES_QUERY_KEY = ['categories'];
export const CATEGORY_TREE_QUERY_KEY = ['categories', 'tree'];
export const PUBLIC_CATEGORY_TREE_QUERY_KEY = ['public', 'categories', 'tree'];

export function useCategoriesQuery() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      return response.data;
    },
  });
}

export function useCategoryTreeQuery() {
  return useQuery({
    queryKey: CATEGORY_TREE_QUERY_KEY,
    queryFn: async () => {
      const response = await categoriesApi.getTree();
      return response.data;
    },
  });
}

export function usePublicCategoryTreeQuery() {
  return useQuery({
    queryKey: PUBLIC_CATEGORY_TREE_QUERY_KEY,
    queryFn: async () => {
      const response = await categoriesApi.getPublicTree();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoriesApi.create(data),
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORY_TREE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_CATEGORY_TREE_QUERY_KEY });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to create category';
      toast.error(msg);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateCategoryData }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORY_TREE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_CATEGORY_TREE_QUERY_KEY });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to update category';
      toast.error(msg);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => categoriesApi.delete(id),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORY_TREE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_CATEGORY_TREE_QUERY_KEY });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to delete category';
      toast.error(msg);
    },
  });
}
