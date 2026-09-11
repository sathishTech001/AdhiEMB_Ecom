import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import {
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  ProductApprovalData,
} from '../types/product.types';
import { toast } from 'react-hot-toast';

export const PRODUCTS_QUERY_KEY = ['products'];
export const PUBLIC_PRODUCTS_QUERY_KEY = ['public', 'products'];

export function useProductsQuery(filters?: ProductFilters) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, filters],
    queryFn: async () => {
      const response = await productsApi.getAll(filters);
      return response.data;
    },
  });
}

export function useProductQuery(id: string | number) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'detail', id],
    queryFn: async () => {
      const response = await productsApi.getById(id);
      return response.data;
    },
    enabled: Boolean(id),
  });
}

export function usePublicProductQuery(slug: string) {
  return useQuery({
    queryKey: [...PUBLIC_PRODUCTS_QUERY_KEY, 'slug', slug],
    queryFn: async () => {
      const response = await productsApi.getPublicBySlug(slug);
      return response.data;
    },
    enabled: Boolean(slug),
  });
}

export function usePublicProductsSearchQuery(filters?: ProductFilters) {
  return useQuery({
    queryKey: [...PUBLIC_PRODUCTS_QUERY_KEY, 'search', filters],
    queryFn: async () => {
      const response = await productsApi.searchPublic(filters);
      return response.data;
    },
  });
}

export function useFeaturedProductsQuery() {
  return useQuery({
    queryKey: [...PUBLIC_PRODUCTS_QUERY_KEY, 'featured'],
    queryFn: async () => {
      const response = await productsApi.getFeatured();
      const resData = response.data as any;
      return Array.isArray(resData) ? resData : resData?.content || resData?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => productsApi.create(data),
    onSuccess: (_, variables) => {
      if (variables.status === 'PENDING_APPROVAL') {
        toast.success('Product submitted for approval successfully!');
      } else {
        toast.success('Product draft saved successfully!');
      }
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to create product';
      toast.error(msg);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateProductData }) =>
      productsApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, 'detail', variables.id] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to update product';
      toast.error(msg);
    },
  });
}

export function useSubmitProductForApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => productsApi.submitForApproval(id),
    onSuccess: (_, id) => {
      toast.success('Product submitted for approval!');
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, 'detail', id] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to submit product';
      toast.error(msg);
    },
  });
}

export function useApproveOrRejectProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: ProductApprovalData }) =>
      productsApi.approveOrReject(id, data),
    onSuccess: (_, variables) => {
      const statusText = variables.data.status === 'APPROVED' ? 'approved' : 'rejected';
      toast.success(`Product ${statusText} successfully`);
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, 'detail', variables.id] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to process product approval';
      toast.error(msg);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => productsApi.delete(id),
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to delete product';
      toast.error(msg);
    },
  });
}

export function useFileUpload() {
  return useMutation({
    mutationFn: (formData: FormData) => productsApi.uploadFile(formData),
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to upload file';
      toast.error(msg);
    },
  });
}
