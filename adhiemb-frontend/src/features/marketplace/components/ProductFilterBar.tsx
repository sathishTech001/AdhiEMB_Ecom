import { SearchInput } from '@/components/ui/SearchInput';
import { MachineFormat } from '@/features/products/types/product.types';
import { CategoryTree } from '@/features/categories/types/category.types';
import { RefreshCw } from 'lucide-react';

const FORMAT_OPTIONS: (MachineFormat | 'ALL')[] = ['ALL', 'DST', 'PES', 'EXP', 'JEF', 'EMB'];

interface ProductFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  selectedFormat: MachineFormat | 'ALL';
  onFormatChange: (format: MachineFormat | 'ALL') => void;
  minPrice: string;
  onMinPriceChange: (value: string) => void;
  maxPrice: string;
  onMaxPriceChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  categories: CategoryTree[];
  onResetFilters: () => void;
}

export const ProductFilterBar = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedFormat,
  onFormatChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  sortBy,
  onSortByChange,
  categories,
  onResetFilters,
}: ProductFilterBarProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
      {/* Top Search & Main Dropdowns Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-5">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search embroidery patterns, tags, or styles..."
          />
        </div>

        {/* Category Dropdown */}
        <div className="md:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div className="md:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price_low">Sort: Price Low to High</option>
            <option value="price_high">Sort: Price High to Low</option>
            <option value="popularity">Sort: Most Popular</option>
            <option value="rating">Sort: Top Rated</option>
          </select>
        </div>
      </div>

      {/* Bottom Filter Row: Machine Formats & Price Range */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Machine Format Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Machine Format:
          </span>
          {FORMAT_OPTIONS.map((fmt) => {
            const isSelected = selectedFormat === fmt;
            return (
              <button
                key={fmt}
                type="button"
                onClick={() => onFormatChange(fmt)}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {fmt === 'ALL' ? 'All Formats' : `.${fmt}`}
              </button>
            );
          })}
        </div>

        {/* Price Range & Reset */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Price ($):</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="w-16 h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 text-xs font-semibold text-center"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="w-16 h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 text-xs font-semibold text-center"
            />
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
