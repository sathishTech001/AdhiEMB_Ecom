import { Link } from 'react-router-dom';
import { Star, Sparkles, Eye, Layers, Ruler, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Product } from '@/features/products/types/product.types';
import { useToggleWishlist } from '@/features/wishlist/hooks/useWishlist';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const toggleWishlist = useToggleWishlist();

  const imageUrl = product.primaryImage ||
    (product.images && product.images.length > 0
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
      : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');

  const rating = product.rating || 4.9;
  const reviewCount = product.reviewCount || 18;
  const formats = product.formats || ['DST', 'PES', 'EXP', 'JEF'];

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between">
      {/* Image Container with Zoom Effect */}
      <div className="relative aspect-square overflow-hidden bg-slate-950">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Overlay Blur / Gradient on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Badges & Wishlist Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {product.isFeatured ? (
            <span className="inline-flex items-center gap-1 bg-amber-500/90 backdrop-blur-md text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-lg">
              <Sparkles className="w-3 h-3 fill-current" />
              FEATURED
            </span>
          ) : (
            <span className="inline-flex items-center bg-slate-900/70 backdrop-blur-md text-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/10">
              {product.categoryName || 'Embroidery'}
            </span>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist.mutate({ productId: product.id, isInWishlist: false });
            }}
            className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full text-slate-700 dark:text-slate-200 hover:text-red-500 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-md"
            title="Save to Wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Machine Formats Floating Tag Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 flex-wrap">
          {formats.slice(0, 3).map((fmt) => (
            <span
              key={fmt}
              className="bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-sm"
            >
              .{fmt}
            </span>
          ))}
          {formats.length > 3 && (
            <span className="bg-indigo-600/90 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md">
              +{formats.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Designer & Rating Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
              {product.designerName || 'AdhiEMB Studio'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/designs/${product.slug}`}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Key Specs Pill Row */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              {product.stitchCount ? product.stitchCount.toLocaleString() : '12.5k'} Stitches
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-emerald-500" />
              {product.widthMm}x{product.heightMm}mm
            </span>
          </div>
        </div>

        {/* Pricing & CTA Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ${(product.discountPrice || product.price)?.toFixed(2)}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-slate-400 line-through font-semibold">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <Link to={`/designs/${product.slug}`}>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 group-hover:bg-indigo-700"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              View Design
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
