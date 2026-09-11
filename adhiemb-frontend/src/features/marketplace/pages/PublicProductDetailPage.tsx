import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  ZoomIn,
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { ProductCard } from '../components/ProductCard';
import { usePublicProductQuery, usePublicProductsSearchQuery } from '@/features/products/hooks/useProducts';
import { useCart } from '@/features/cart/context/CartContext';
import { toast } from 'react-hot-toast';
import { formatCurrency, getImageUrl } from '@/lib/utils';

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
  const navigate = useNavigate();
  const { addToCart, addFilesToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<(string | number)[]>([]);

  const { data: product, isLoading, isError } = usePublicProductQuery(slug || '');

  // Initialize selected files
  useEffect(() => {
    if (product && product.files && product.files.length > 0) {
      setSelectedFileIds(product.files.map((f, i) => (f.id !== undefined && f.id !== null ? f.id : i)));
    }
  }, [product]);

  // Related products query
  const { data: relatedData } = usePublicProductsSearchQuery({
    categoryId: product?.categoryId,
    size: 4,
  });

  const relatedProducts = (relatedData as any)?.content || (relatedData as any)?.data || (Array.isArray(relatedData) ? relatedData : []);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-slate-500 text-sm mt-4 font-medium">Loading embroidery design...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
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

  const availableFiles = product.files || [];
  const hasFiles = availableFiles.length > 0;
  const selectedFiles = availableFiles.filter((f, i) => selectedFileIds.includes(f.id !== undefined && f.id !== null ? f.id : i));
  const selectedTotal = selectedFiles.reduce((acc, f) => acc + (f.price !== undefined && f.price !== null ? f.price : 0), 0);
  const effectiveDisplayPrice = selectedFiles.length > 0 ? selectedTotal : 0;

  const getRawImg = (img: any): string => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    return img.imageUrl || img.url || '';
  };

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images.map(getRawImg).filter(Boolean).map(getImageUrl)
    : (product.primaryImage ? [getImageUrl(product.primaryImage)] : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80']);

  const primaryImg = selectedImage 
    ? getImageUrl(selectedImage) 
    : (galleryImages.length > 0 ? galleryImages[0] : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');

  const handleAddToCart = async () => {
    if (hasFiles) {
      if (selectedFiles.length === 0) {
        toast.error('Please select at least one machine file to purchase');
        return;
      }
      await addFilesToCart(product, selectedFiles);
    } else {
      await addToCart(product);
    }
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 3000);
  };

  const handleBuyNow = async () => {
    if (hasFiles && selectedFiles.length === 0) {
      toast.error('Please select at least one machine file to purchase');
      return;
    }
    await handleAddToCart();
    navigate('/checkout');
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

          {/* Right Column: Title, Designer, Multi-File Selection & Cart Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="primary" className="text-xs font-bold uppercase tracking-wider">
                  {product.categoryName || 'Embroidery Design'}
                </Badge>
                {product.designType && (
                  <Badge variant="info" className="text-xs font-semibold">
                    {product.designType}
                  </Badge>
                )}
                {product.productCode && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {product.productCode}
                  </span>
                )}
              </div>

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

            {/* Multi-File Selection Checklist Section */}
            {hasFiles ? (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Available Machine Files
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Select individual files you wish to purchase
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedFileIds.length === availableFiles.length) {
                        setSelectedFileIds([]);
                      } else {
                        setSelectedFileIds(availableFiles.map((f, i) => (f.id !== undefined && f.id !== null ? f.id : i)));
                      }
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {selectedFileIds.length === availableFiles.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {availableFiles.map((f, idx) => {
                    const id = f.id !== undefined && f.id !== null ? f.id : idx;
                    const isSelected = selectedFileIds.includes(id);
                    const format = f.fileFormat || f.format || 'DST';
                    const fileName = f.originalFileName || f.fileName || `file_${idx + 1}.${String(format).toLowerCase()}`;
                    const price = f.price !== undefined && f.price !== null ? f.price : 0;

                    return (
                      <div
                        key={id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedFileIds(selectedFileIds.filter((x) => x !== id));
                          } else {
                            setSelectedFileIds([...selectedFileIds, id]);
                          }
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/50 shadow-xs'
                            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white shrink-0">
                            .{format}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 block truncate">
                              {f.machineInfo ? `${f.machineInfo} (${fileName})` : fileName}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                          {formatCurrency(price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Price & Summary Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-200 uppercase tracking-wider font-bold">
                  {hasFiles ? `Selected Files Total (${selectedFiles.length}/${availableFiles.length})` : 'Instant Digital Download'}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black">
                  {formatCurrency(effectiveDisplayPrice)}
                </span>
              </div>
              <p className="text-xs text-indigo-100/70">
                {hasFiles
                  ? 'Includes authenticated secure machine files for download upon purchase.'
                  : 'Includes embroidery production worksheet and all standard machine formats.'}
              </p>
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
                {isAddedToCart ? 'Added to Cart!' : (hasFiles && selectedFiles.length > 0 ? `Add Selected (${selectedFiles.length}) to Cart` : 'Add to Cart')}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                className="w-full py-4 text-base font-bold rounded-2xl border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 dark:text-indigo-400"
              >
                <Zap className="w-5 h-5 mr-2 text-amber-500" />
                Buy Selected Now (Instant Checkout)
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
                <span>Secure Protected Download</span>
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
