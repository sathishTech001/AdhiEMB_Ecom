import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Edit3, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ProductForm } from '../components/ProductForm';
import { useProductQuery, useUpdateProduct } from '../hooks/useProducts';
import { CreateProductData } from '../types/product.types';

export function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProductQuery(id || '');
  const updateProductMutation = useUpdateProduct();

  const handleSubmit = async (data: CreateProductData, status: 'DRAFT' | 'PENDING_APPROVAL') => {
    if (!id) return;
    await updateProductMutation.mutateAsync({
      id,
      data: {
        ...data,
        status,
      },
    });
    navigate(`/products/${id}`);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-slate-500 text-sm mt-4">Loading product for editing...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Design Not Found</h2>
        <p className="text-slate-500 text-sm mt-2">The requested embroidery product could not be found.</p>
        <Button onClick={() => navigate('/products')} className="mt-4">
          Back to Products List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <Link to="/products" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/products/${id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {product.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-slate-200 font-medium">
            Edit Design
          </span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/products/${id}`)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Edit Embroidery Design
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update machine files, dimensions, stitch count, pricing, and category.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate(`/products/${id}`)}
            className="flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> View Details
          </Button>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="p-6 sm:p-8 shadow-xl border border-slate-200/60 dark:border-slate-800">
        <ProductForm
          initialValues={product}
          onSubmit={handleSubmit}
          isLoading={updateProductMutation.isPending}
        />
      </Card>
    </div>
  );
}
