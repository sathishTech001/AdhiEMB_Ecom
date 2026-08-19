import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, PackagePlus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProductForm } from '../components/ProductForm';
import { useCreateProduct } from '../hooks/useProducts';
import { CreateProductData } from '../types/product.types';

export function CreateProductPage() {
  const navigate = useNavigate();
  const createProductMutation = useCreateProduct();

  const handleSubmit = async (data: CreateProductData, status: 'DRAFT' | 'PENDING_APPROVAL') => {
    await createProductMutation.mutateAsync({
      ...data,
      status,
    });
    navigate('/products');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <Link to="/products" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-slate-200 font-medium">
            Upload New Design
          </span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/products')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PackagePlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Upload New Embroidery Design
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add machine files, dimensions, stitch count, and pricing details.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="p-6 sm:p-8 shadow-xl border border-slate-200/60 dark:border-slate-800">
        <ProductForm
          onSubmit={handleSubmit}
          isLoading={createProductMutation.isPending}
        />
      </Card>
    </div>
  );
}
