import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '@/features/products/types/product.types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Layers } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyTitle = 'No Designs Found',
  emptyDescription = 'Try adjusting your search or filters to discover available digital embroidery patterns.',
}) => {
  // Safely extract array regardless of whether products is an Array, ApiResponse object, or Paged object
  const productList: Product[] = Array.isArray(products)
    ? products
    : (products && typeof products === 'object' && 'data' in (products as any) && Array.isArray((products as any).data))
    ? (products as any).data
    : (products && typeof products === 'object' && 'content' in (products as any) && Array.isArray((products as any).content))
    ? (products as any).content
    : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 animate-pulse"
          >
            <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
            <div className="pt-2 flex justify-between items-center">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!productList || productList.length === 0) {
    return (
      <div className="py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <EmptyState
          icon={<Layers className="w-12 h-12 text-slate-300 dark:text-slate-600" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productList.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
