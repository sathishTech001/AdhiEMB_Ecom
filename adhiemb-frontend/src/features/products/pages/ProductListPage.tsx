import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Send, 
  MoreVertical
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { ProductStatusBadge } from '../components/ProductStatusBadge';
import { 
  useProductsQuery, 
  useSubmitProductForApproval, 
  useApproveOrRejectProduct, 
  useDeleteProduct 
} from '../hooks/useProducts';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategories';
import { Product, ProductStatus } from '../types/product.types';

export function ProductListPage({ defaultTab = 'ALL' }: { defaultTab?: ProductStatus | 'ALL' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProductStatus | 'ALL'>(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Approval Modal state
  const [approvalProduct, setApprovalProduct] = useState<Product | null>(null);
  const [approvalAction, setApprovalAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // Queries & Mutations
  const { data: categories = [] } = useCategoriesQuery();
  const { data: pagedData, isLoading } = useProductsQuery({
    search: searchTerm || undefined,
    categoryId: selectedCategory || undefined,
    status: activeTab === 'ALL' ? undefined : activeTab,
    page,
    size: pageSize,
  });

  const submitForApprovalMutation = useSubmitProductForApproval();
  const approveOrRejectMutation = useApproveOrRejectProduct();
  const deleteMutation = useDeleteProduct();

  const products = pagedData?.content || [];
  const totalElements = pagedData?.totalElements || 0;
  const totalPages = pagedData?.totalPages || 0;

  const handleOpenApprovalModal = (product: Product, action: 'APPROVED' | 'REJECTED') => {
    setApprovalProduct(product);
    setApprovalAction(action);
    setRejectionReason('');
    setIsApprovalModalOpen(true);
  };

  const handleApprovalSubmit = async () => {
    if (!approvalProduct) return;
    await approveOrRejectMutation.mutateAsync({
      id: approvalProduct.id,
      data: {
        status: approvalAction,
        rejectionReason: approvalAction === 'REJECTED' ? rejectionReason : undefined,
      },
    });
    setIsApprovalModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const statusTabs: { id: ProductStatus | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Designs' },
    { id: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'DRAFT', label: 'Drafts' },
  ];

  const columns: Column<Product>[] = [
    {
      key: 'product',
      label: 'Product',
      render: (product: Product) => (
        <div className="flex items-center gap-3">
          <img
            src={product.primaryImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'}
            alt={product.title}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
          />
          <div>
            <Link
              to={`/products/${product.id}`}
              className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1"
            >
              {product.title}
            </Link>
            <span className="text-xs text-slate-400 font-mono">
              Slug: {product.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (product: Product) => (
        <Badge variant="primary" className="text-xs font-medium">
          {product.categoryName || 'General'}
        </Badge>
      ),
    },
    {
      key: 'designer',
      label: 'Designer',
      render: (product: Product) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {product.designerName || 'AdhiEMB Studio'}
        </span>
      ),
    },
    {
      key: 'specifications',
      label: 'Specifications',
      render: (product: Product) => (
        <div className="text-xs space-y-0.5">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            {product.stitchCount ? product.stitchCount.toLocaleString() : 0} Stitches
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            {product.widthMm}mm × {product.heightMm}mm
          </div>
        </div>
      ),
    },
    {
      key: 'formats',
      label: 'Formats',
      render: (product: Product) => (
        <div className="flex flex-wrap gap-1 max-w-[140px]">
          {(product.formats || ['DST', 'PES']).slice(0, 3).map((fmt) => (
            <Badge key={fmt} variant="default" className="text-[10px] px-1.5 py-0 font-mono">
              .{fmt}
            </Badge>
          ))}
          {product.formats && product.formats.length > 3 && (
            <span className="text-[10px] text-slate-400">+{product.formats.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (product: Product) => (
        <div>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            ${product.price?.toFixed(2)}
          </span>
          {product.discountPrice && (
            <span className="text-xs text-slate-400 line-through ml-1.5">
              ${product.discountPrice.toFixed(2)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (product: Product) => (
        <ProductStatusBadge status={product.status} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product: Product) => (
        <Dropdown
          trigger={
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          }
          items={[
            {
              key: 'view',
              label: 'View Details',
              onClick: () => navigate(`/products/${product.id}`),
              icon: <Eye className="w-4 h-4 text-blue-500" />,
            },
            {
              key: 'edit',
              label: 'Edit Design',
              onClick: () => navigate(`/products/${product.id}`),
              icon: <Edit3 className="w-4 h-4 text-indigo-500" />,
            },
            ...(product.status === 'DRAFT'
              ? [
                  {
                    key: 'submit',
                    label: 'Submit for Approval',
                    onClick: () => submitForApprovalMutation.mutate(product.id),
                    icon: <Send className="w-4 h-4 text-amber-500" />,
                  },
                ]
              : []),
            ...(product.status === 'PENDING_APPROVAL'
              ? [
                  {
                    key: 'approve',
                    label: 'Approve Design',
                    onClick: () => handleOpenApprovalModal(product, 'APPROVED'),
                    icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
                  },
                  {
                    key: 'reject',
                    label: 'Reject Design',
                    onClick: () => handleOpenApprovalModal(product, 'REJECTED'),
                    danger: true,
                    icon: <XCircle className="w-4 h-4 text-red-500" />,
                  },
                ]
              : []),
            {
              key: 'delete',
              label: 'Delete',
              onClick: () => setDeletingId(product.id),
              danger: true,
              icon: <Trash2 className="w-4 h-4 text-red-500" />,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium mb-1">
            <Package className="w-4 h-4" />
            Product Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Embroidery Designs Directory
          </h1>
          <p className="text-indigo-100/80 text-sm mt-1 max-w-xl">
            Review design uploads, approve designer submissions, manage machine formats, and set pricing.
          </p>
        </div>

        <Button
          onClick={() => navigate('/products/create')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload New Design
        </Button>
      </div>

      {/* Main Content Container */}
      <Card className="p-6">
        {/* Status Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto pb-1 mb-6">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(0);
              }}
              className={`px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="sm:col-span-2">
            <SearchInput
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setPage(0);
              }}
              placeholder="Search designs by title, slug or designer..."
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* DataTable Component */}
        <DataTable<Product>
          columns={columns}
          data={products}
          isLoading={isLoading}
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalElements={totalElements}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(0);
          }}
        />
      </Card>

      {/* Approve / Reject Modal */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        title={approvalAction === 'APPROVED' ? 'Approve Product' : 'Reject Product'}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {approvalAction === 'APPROVED'
              ? `Are you sure you want to approve "${approvalProduct?.title}"? It will become visible in the public marketplace.`
              : `Specify the reason for rejecting "${approvalProduct?.title}". The designer will receive this feedback.`}
          </p>

          {approvalAction === 'REJECTED' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rejection Reason *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Stitch count exceeds bounds, missing .PES format file..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={approvalAction === 'APPROVED' ? 'primary' : 'danger'}
              isLoading={approveOrRejectMutation.isPending}
              onClick={handleApprovalSubmit}
            >
              {approvalAction === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Embroidery Design"
        message="Are you sure you want to delete this design permanently?"
        confirmLabel="Delete Product"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
