import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api/wishlist.api';
import toast from 'react-hot-toast';

export const WISHLIST_QUERY_KEY = ['wishlist'];

export function useWishlistQuery() {
  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: async () => {
      const res = await wishlistApi.getWishlist();
      return res.data || [];
    },
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, isInWishlist }: { productId: number | string; isInWishlist: boolean }) => {
      if (isInWishlist) {
        await wishlistApi.removeFromWishlist(productId);
      } else {
        await wishlistApi.addToWishlist(productId);
      }
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isInWishlist ? 'Removed from wishlist' : 'Saved to wishlist!');
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
    onError: () => {
      toast.error('Please log in to manage your wishlist');
    },
  });
}
