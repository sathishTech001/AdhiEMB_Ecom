import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Award,
  Download,
  ShieldCheck,
  Cpu,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FeaturedCategories } from '../components/FeaturedCategories';
import { ProductGrid } from '../components/ProductGrid';
import { useFeaturedProductsQuery } from '@/features/products/hooks/useProducts';

export function HomePage() {
  const { data: featuredProducts = [], isLoading: isFeaturedLoading } = useFeaturedProductsQuery();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950 text-white py-24 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-md px-4 py-2 rounded-full text-indigo-300 text-xs sm:text-sm font-semibold border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Official Digital Embroidery Design Store</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            Professionally Digitized<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-300">
              Embroidery Designs & Patterns
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-indigo-100/80 font-normal leading-relaxed">
            High-precision embroidery machine files ready for instant download. Pre-tested for perfect stitch density, clean thread transitions, and zero breakage.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link to="/designs">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-xl shadow-emerald-500/25 px-8 py-4 text-base font-bold rounded-2xl"
              >
                Browse All Designs
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10 px-8 py-4 text-base font-bold rounded-2xl"
              >
                Create Account
              </Button>
            </Link>
          </div>

          {/* Machine Format Badges */}
          <div className="pt-10 flex flex-wrap justify-center items-center gap-4 text-xs font-mono font-bold text-indigo-200/90">
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15">.DST (Tajima)</span>
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15">.PES (Brother)</span>
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15">.JEF (Janome)</span>
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15">.EXP (Bernina)</span>
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15">.VP3 (Husqvarna)</span>
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15">.XXX (Singer)</span>
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15">.EMB (Wilcom)</span>
          </div>
        </div>
      </section>

      {/* Customer Benefit Value Prop Cards */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Stitch-Tested Precision</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every design is pre-tested on commercial embroidery machines to guarantee optimal density and zero thread breakage.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Instant File Vault</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Download your machine files instantly after payment and access them anytime in your personal digital vault.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Multi-Machine Formats</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Includes .DST, .PES, .EXP, .JEF, .VP3, .XXX, and master .EMB files for seamless machine loading.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Commercial Use Included</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              All design purchases include a full commercial production license for apparel, gifts, and embroidery businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Featured Categories Component */}
      <FeaturedCategories />

      {/* Dynamic Featured Designs Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              Featured Catalog
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Popular Embroidery Designs</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Hand-crafted digitized designs ready for immediate machine loading.
            </p>
          </div>

          <Link to="/designs">
            <Button variant="outline" className="rounded-xl">
              View Catalog <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        <ProductGrid
          products={featuredProducts}
          isLoading={isFeaturedLoading}
          emptyTitle="No Featured Designs Yet"
          emptyDescription="Explore our main design catalog to discover digitized patterns."
        />
      </section>

      {/* Why Choose AdhiEMB CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-black">
            Ready to Elevate Your Embroidery Production?
          </h2>
          <p className="max-w-2xl mx-auto text-indigo-100/80 text-base">
            Get instant access to commercial-grade digitized patterns with clean density, smooth color stops, and multi-machine format compatibility.
          </p>

          <Link to="/designs">
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-xl shadow-emerald-500/30 px-8 py-4 text-base font-bold rounded-2xl"
            >
              Explore Full Catalog Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
