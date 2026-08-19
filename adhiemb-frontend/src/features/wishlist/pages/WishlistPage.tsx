import { Heart, Sparkles, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlistQuery, useToggleWishlist } from '../hooks/useWishlist';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/features/cart/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export function WishlistPage() {
  const { data: wishlistItems = [], isLoading } = useWishlistQuery();
  const toggleWishlist = useToggleWishlist();
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 min-h-screen">
        <Spinner size="lg" />
        <p className="text-slate-500 text-sm mt-4 font-medium">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-indigo-200 text-xs font-semibold border border-white/10">
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
              <span>Saved Design Collection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">My Wishlist</h1>
            <p className="text-indigo-100/80 text-sm max-w-xl">
              Keep track of your favorite digital embroidery patterns and add them to your cart when ready to build.
            </p>
          </div>

          <Link to="/designs">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg">
              Explore More Designs
            </Button>
          </Link>
        </div>

        {/* Wishlist Items Grid */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <EmptyState
              icon={<Heart className="w-12 h-12 text-slate-300 dark:text-slate-600" />}
              title="Your Wishlist is Empty"
              description="Browse our digital catalog and click the heart icon on any design to save it here."
            />
            <div className="mt-6">
              <Link to="/designs">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {product.primaryImage ? (
                        <img
                          src={product.primaryImage}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Sparkles className="w-8 h-8" />
                        </div>
                      )}

                      <button
                        onClick={() => toggleWishlist.mutate({ productId: product.id, isInWishlist: true })}
                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-900/90 rounded-full text-red-500 hover:scale-110 transition-transform shadow-md"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <Link to={`/designs/${product.slug}`} className="font-bold text-slate-900 dark:text-white text-base hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1">
                        {product.title}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {product.stitchCount ? `${product.stitchCount.toLocaleString()} stitches` : 'Digital Pattern'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {formatCurrency(product.discountPrice || product.price)}
                    </span>

                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                      leftIcon={<ShoppingBag className="w-4 h-4" />}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
