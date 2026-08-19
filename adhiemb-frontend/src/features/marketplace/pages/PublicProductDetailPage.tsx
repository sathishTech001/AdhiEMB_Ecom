import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Star, 
  ShoppingCart, 
  Zap, 
  Layers, 
  Ruler, 
  Palette, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw, 
  Cpu, 
  ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { ProductCard } from '../components/ProductCard';
import { usePublicProductQuery, usePublicProductsSearchQuery } from '@/features/products/hooks/useProducts';
import { toast } from 'react-hot-toast';

const COMPATIBLE_BRANDS = [
  { name: 'Tajima', description: 'Supports .DST format' },
  { name: 'Barudan', description: 'Supports .DST / .DAT format' },
  { name: 'Brother / Baby Lock', description: 'Supports .PES format' },
  { name: 'Janome / Elna', description: 'Supports .JEF format' },
  { name: 'Melco / Bernina', description: 'Supports .EXP format' },
  { name: 'Husqvarna Viking', description: 'Supports .VP3 / .HUS format' },
];

export function PublicProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const { data: product, isLoading, isError } = usePublicProductQuery(slug || '');

  // Related products query
  const { data: relatedData } = usePublicProductsSearchQuery({
    categoryId: product?.categoryId,
    size: 4,
  });

  const relatedProducts = (Array.isArray(relatedData) ? relatedData : relatedData?.content || []).filter((p: any) => p.id !== product?.id);

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 min-h-screen">
        <Spinner size="lg" />
        <p className="text-slate-500 text-sm mt-4 font-medium">Loading embroidery design...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Design Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            The embroidery design pattern you are looking for may have been moved or archived.
          </p>
          <Link to="/designs">
            <Button className="mt-4">Browse All Designs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryImg = selectedImage || product.primaryImage ||
    (product.images && product.images.length > 0
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
      : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');

  const galleryImages = product.images?.map(img => typeof img === 'string' ? img : img.url) || [primaryImg];

  const handleAddToCart = () => {
    setIsAddedToCart(true);
    toast.success(`Added "${product.title}" to cart!`);
    setTimeout(() => setIsAddedToCart(false), 3000);
  };

  const handleBuyNow = () => {
    toast.success(`Proceeding to instant checkout for "${product.title}"`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Breadcrumb Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link to="/designs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Designs
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
            {product.categoryName || 'Embroidery'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-slate-900 dark:text-slate-200 font-bold truncate max-w-[200px] sm:max-w-none">
            {product.title}
          </span>
        </div>
      </div>

      {/* Hero Product Stage Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery Carousel & Zoom */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative group bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl aspect-square flex items-center justify-center">
              <img
                src={primaryImg}
                alt={product.title}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />

              <button
                onClick={() => setIsZoomOpen(true)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-900 transition-all shadow-lg"
                title="Zoom Image"
              >
                <ZoomIn className="w-5 h-5" />
              </button>

              {product.isFeatured && (
                <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  PREMIUM DESIGN
                </span>
              )}
            </div>

            {/* Thumbnails list */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                      primaryImg === imgUrl
                        ? 'border-indigo-600 scale-105 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Designer, Pricing & Cart Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <Badge variant="primary" className="text-xs font-bold uppercase tracking-wider mb-2">
                {product.categoryName || 'Embroidery Design'}
              </Badge>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {product.title}
              </h1>

              {/* Rating & Designer info */}
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating || 4.9}</span>
                  <span className="text-slate-400 text-xs font-normal">
                    ({product.reviewCount || 24} reviews)
                  </span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                  {product.salesCount || 142} Downloads
                </span>
              </div>
            </div>

            {/* Designer Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-base shadow-md">
                  {product.designerName ? product.designerName.charAt(0) : 'A'}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Digitized By
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {product.designerName || 'AdhiEMB Master Studio'}
                  </div>
                </div>
              </div>
              <Badge variant="success" className="text-[10px]">Verified Designer</Badge>
            </div>

            {/* Price & Discount Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl space-y-2">
              <span className="text-xs text-indigo-200 uppercase tracking-wider font-bold">
                Instant Digital Download
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black">
                  ${(product.discountPrice || product.price)?.toFixed(2)}
                </span>
                {product.discountPrice && (
                  <span className="text-xl text-indigo-200/60 line-through font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-100/70">
                Includes all formats (.DST, .PES, .EXP, .JEF, .EMB) in a single ZIP file with embroidery production worksheet.
              </p>
            </div>

            {/* Formats Tags List */}
            <div>
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Included Machine Formats:
              </label>
              <div className="flex flex-wrap gap-2">
                {(product.formats || ['DST', 'PES', 'EXP', 'JEF', 'EMB', 'VP3']).map((fmt) => (
                  <span
                    key={fmt}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 shadow-sm"
                  >
                    .{fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="space-y-3 pt-2">
              <Button
                size="lg"
                onClick={handleAddToCart}
                className={`w-full py-4 text-base font-bold shadow-lg rounded-2xl transition-all ${
                  isAddedToCart
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                }`}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isAddedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                className="w-full py-4 text-base font-bold rounded-2xl border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 dark:text-indigo-400"
              >
                <Zap className="w-5 h-5 mr-2 text-amber-500" />
                Buy Now (Instant Checkout)
              </Button>
            </div>

            {/* Guarantee Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Stitch Tested</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Format Re-convert Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Compatible Machines Section */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Technical Design Specifications
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Stitch Count
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {product.stitchCount ? product.stitchCount.toLocaleString() : '12,500'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-emerald-500" />
                  Dimensions
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {product.widthMm} × {product.heightMm} mm
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  Total Colors
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {product.colorCount || 6} Colors
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-500" />
                  Color Changes
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {product.stopCount || 8} Stops
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Design Overview & Machine Notes
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-4xl">
              {product.description ||
                'This digital embroidery pattern is digitised with optimal underlay and density settings suitable for cotton, polyester, denim, and jacket back placement. Delivered in a compressed ZIP archive containing all major commercial and home embroidery machine formats.'}
            </p>
          </div>

          {/* Compatible Machine Brands Grid */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-500" />
              Compatible Machine Brands
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {COMPATIBLE_BRANDS.map((brand) => (
                <div
                  key={brand.name}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center space-y-1"
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {brand.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {brand.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Embroidery Products Carousel/Grid */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Related Embroidery Designs
                </h2>
                <p className="text-slate-500 text-sm">
                  More top-rated patterns from the {product.categoryName || 'same'} category
                </p>
              </div>

              <Link to="/designs">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct: any) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Image Zoom Modal */}
      <Modal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        title={product.title}
        size="xl"
      >
        <div className="flex items-center justify-center p-2 bg-slate-950 rounded-2xl overflow-hidden aspect-square">
          <img src={primaryImg} alt={product.title} className="max-h-[75vh] object-contain" />
        </div>
      </Modal>
    </div>
  );
}
