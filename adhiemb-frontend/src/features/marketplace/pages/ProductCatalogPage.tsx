import { useState } from 'react';
import { ProductFilterBar } from '../components/ProductFilterBar';
import { ProductGrid } from '../components/ProductGrid';
import { Pagination } from '@/components/ui/Pagination';
import { usePublicProductsSearchQuery } from '@/features/products/hooks/useProducts';
import { usePublicCategoryTreeQuery } from '@/features/categories/hooks/useCategories';
import { MachineFormat } from '@/features/products/types/product.types';
import { Sparkles } from 'lucide-react';

export function ProductCatalogPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<MachineFormat | 'ALL'>('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // Fetch Public Categories
  const { data: categoriesTree = [] } = usePublicCategoryTreeQuery();

  // Fetch Public Products
  const { data: pagedResponse, isLoading } = usePublicProductsSearchQuery({
    search: search || undefined,
    categoryId: selectedCategory || undefined,
    format: selectedFormat === 'ALL' ? undefined : selectedFormat,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    sortBy: sortBy as any,
    page,
    size: pageSize,
  });

  const products = pagedResponse?.content || [];
  const totalPages = pagedResponse?.totalPages || 1;
  const totalElements = pagedResponse?.totalElements || 0;

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedFormat('ALL');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Hero Banner Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-950 text-white py-16 px-4 sm:px-6 lg:px-8 mb-10 shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Machine Embroidery Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Explore Embroidery Designs
          </h1>

          <p className="max-w-2xl mx-auto text-indigo-100/80 text-base sm:text-lg font-normal">
            Browse thousands of multi-format digitizing patterns ready for Tajima, Barudan, Brother, Janome, and Singer machines.
          </p>
        </div>
      </section>

      {/* Main Catalog Workspace Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Filter Bar */}
        <ProductFilterBar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(0);
          }}
          selectedCategory={selectedCategory}
          onCategoryChange={(val) => {
            setSelectedCategory(val);
            setPage(0);
          }}
          selectedFormat={selectedFormat}
          onFormatChange={(fmt) => {
            setSelectedFormat(fmt);
            setPage(0);
          }}
          minPrice={minPrice}
          onMinPriceChange={(val) => {
            setMinPrice(val);
            setPage(0);
          }}
          maxPrice={maxPrice}
          onMaxPriceChange={(val) => {
            setMaxPrice(val);
            setPage(0);
          }}
          sortBy={sortBy}
          onSortByChange={(val) => {
            setSortBy(val);
            setPage(0);
          }}
          categories={categoriesTree}
          onResetFilters={handleResetFilters}
        />

        {/* Product Grid */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          emptyTitle="No Embroidery Patterns Found"
          emptyDescription="Try broadening your search query or removing active category/format filters."
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center pt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalElements={totalElements}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              onPageSizeChange={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
