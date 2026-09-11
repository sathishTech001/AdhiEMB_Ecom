import { useNavigate } from 'react-router-dom';
import { Star, Sparkles, Layers, Ruler, Heart } from 'lucide-react';
import { Product } from '@/features/products/types/product.types';
import { useToggleWishlist } from '@/features/wishlist/hooks/useWishlist';
import { getImageUrl } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const toggleWishlist = useToggleWishlist();

  const rawImage = product.primaryImageUrl || product.primaryImage ||
    (product.images && product.images.length > 0
      ? (typeof product.images[0] === 'string' ? product.images[0] : ((product.images[0] as any).imageUrl || (product.images[0] as any).url))
      : null);

  const imageUrl = getImageUrl(rawImage) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

  const rating = product.rating || 4.9;
  const reviewCount = product.reviewCount || 18;
  const formats = product.availableFormats || product.formats || ['DST', 'PES', 'EXP', 'JEF'];
  const targetUrl = `/designs/${product.slug || product.id}`;

  return (
    <div
      onClick={() => navigate(targetUrl)}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer select-none"
    >
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
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          <div className="flex items-center gap-1 flex-wrap max-w-[75%]">
            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg">
                <Sparkles className="w-2.5 h-2.5 fill-current" />
                FEATURED
              </span>
            )}
            <span className="inline-flex items-center bg-slate-900/75 backdrop-blur-md text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
              {product.categoryName || 'Embroidery'}
            </span>
            {product.designType && (
              <span className="inline-flex items-center bg-indigo-900/80 backdrop-blur-md text-indigo-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-500/20">
                {product.designType}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
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
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>

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
      </div>
    </div>
  );
};
