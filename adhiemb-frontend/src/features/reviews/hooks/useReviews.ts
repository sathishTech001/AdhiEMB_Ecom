import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews.api';
import { CreateReviewData, ReviewFilters, ReviewStatus } from '../types/review.types';

export const REVIEW_KEYS = {
  all: ['reviews'] as const,
  product: (productId: number | string) => [...REVIEW_KEYS.all, 'product', productId] as const,
  adminList: (filters?: ReviewFilters) => [...REVIEW_KEYS.all, 'admin', filters] as const,
};

export function useProductReviews(productId: number | string) {
  return useQuery({
    queryKey: REVIEW_KEYS.product(productId),
    queryFn: () => reviewsApi.getProductReviews(productId),
    enabled: !!productId,
  });
}

export function useAdminReviews(filters?: ReviewFilters) {
  return useQuery({
    queryKey: REVIEW_KEYS.adminList(filters),
    queryFn: () => reviewsApi.getAllAdmin(filters),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewData) => reviewsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.product(variables.productId) });
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
    },
  });
}

export function useModerateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: ReviewStatus }) =>
      reviewsApi.moderate(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => reviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
    },
  });
}
