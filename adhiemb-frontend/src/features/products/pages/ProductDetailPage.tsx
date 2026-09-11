import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Send, 
  Ruler, 
  Layers, 
  Palette, 
  Clock, 
  Download, 
  AlertTriangle, 
  FileCheck,
  Edit3
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { ProductStatusBadge } from '../components/ProductStatusBadge';
import { 
  useProductQuery, 
  useSubmitProductForApproval, 
  useApproveOrRejectProduct, 
  useDeleteProduct 
} from '../hooks/useProducts';
import { formatCurrency, getImageUrl } from '@/lib/utils';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Approval Modal state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');

  // Delete Dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: product, isLoading, isError } = useProductQuery(id || '');
  const submitForApprovalMutation = useSubmitProductForApproval();
  const approveOrRejectMutation = useApproveOrRejectProduct();
  const deleteMutation = useDeleteProduct();

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-slate-500 text-sm mt-4">Loading design details...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Design Not Found</h2>
        <p className="text-slate-500 text-sm mt-2">The requested embroidery product could not be loaded.</p>
        <Button onClick={() => navigate('/products')} className="mt-4">
          Back to Products List
        </Button>
      </div>
    );
  }

  const getRawImg = (img: any): string => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    return img.imageUrl || img.url || '';
  };

  const imagesList = (product.images && product.images.length > 0)
    ? product.images.map(getRawImg).filter(Boolean).map(getImageUrl)
    : (product.primaryImage ? [getImageUrl(product.primaryImage)] : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80']);

  const primaryImg = selectedImage 
    ? getImageUrl(selectedImage) 
    : (imagesList.length > 0 ? imagesList[0] : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');

  const handleApprovalSubmit = async () => {
    if (!id) return;
    await approveOrRejectMutation.mutateAsync({
      id,
      data: {
        status: approvalAction,
        rejectionReason: approvalAction === 'REJECTED' ? rejectionReason : undefined,
      },
    });
    setIsApprovalModalOpen(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteMutation.mutateAsync(id);
    navigate('/products');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <Link to="/products" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-slate-200 font-medium">
            {product.title}
          </span>
        </nav>

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/products')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {product.title}
                </h1>
                <ProductStatusBadge status={product.status} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {product.id} • Slug: /{product.slug}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {product.status === 'PENDING_APPROVAL' && (
              <>
                <Button
                  onClick={() => {
                    setApprovalAction('APPROVED');
                    setIsApprovalModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setApprovalAction('REJECTED');
                    setIsApprovalModalOpen(true);
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Reject
                </Button>
              </>
            )}

            {product.status === 'DRAFT' && (
              <Button
                onClick={() => submitForApprovalMutation.mutate(product.id)}
                isLoading={submitForApprovalMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Send className="w-4 h-4 mr-1.5" />
                Submit for Approval
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => navigate(`/products/${product.id}/edit`)}
              className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Edit3 className="w-4 h-4 mr-1.5 text-indigo-500" />
              Edit Design
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(true)}
              className="text-red-500 border-slate-200 dark:border-slate-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Rejection Alert Notice if Rejected */}
      {product.status === 'REJECTED' && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Design Submission Rejected</h4>
            <p className="text-sm mt-1 text-red-700 dark:text-red-300">
              {product.rejectionReason || 'No specific rejection reason specified.'}
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery & Machine Files */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gallery */}
          <Card className="p-4 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center">
              <img
                src={primaryImg}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>

            {imagesList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {imagesList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      primaryImg === imgUrl
                        ? 'border-indigo-600 scale-105 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Machine Files Card */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Machine Files & Formats
            </h3>

            {product.files && product.files.length > 0 ? (
              <div className="space-y-3">
                {product.files.map((file, index) => {
                  const format = file.fileFormat || file.format || (file.originalFileName?.split('.').pop()?.toUpperCase()) || 'DST';
                  const fileName = file.originalFileName || file.fileName || file.filePath?.split('/').pop() || `design_${index + 1}.${String(format).toLowerCase()}`;
                  const sizeBytes = file.fileSizeBytes || file.fileSize;
                  const isZip = String(format).toUpperCase() === 'ZIP' || fileName.toLowerCase().endsWith('.zip');

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={isZip ? 'warning' : 'primary'} className="font-mono text-xs px-2.5 py-1">
                          .{String(format).toUpperCase()}
                        </Badge>
                        <div>
                          <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                            {fileName}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {file.machineInfo && (
                              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                                {file.machineInfo}
                              </span>
                            )}
                            {file.price !== undefined && file.price > 0 && (
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {formatCurrency(file.price)}
                              </span>
                            )}
                            {sizeBytes ? (
                              <span className="text-xs text-slate-400">
                                ({(sizeBytes / 1024).toFixed(0)} KB)
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <a
                        href={file.filePath || file.storageKey || file.fileUrl || '#'}
                        download
                        className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {(product.formats || ['DST', 'PES', 'EXP', 'JEF', 'EMB']).map((fmt) => (
                  <Badge key={fmt} variant="default" className="text-sm font-mono px-3 py-1">
                    .{fmt}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Specs & Details Card */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {product.categoryName || 'Embroidery Design'}
                </span>
                {product.designType && (
                  <Badge variant="info" className="text-xs">
                    {product.designType}
                  </Badge>
                )}
                {product.productCode && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {product.productCode}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {product.title}
              </h2>
            </div>

            {/* Technical Specifications Grid */}
            <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Stitch Count
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                  {product.stitchCount ? product.stitchCount.toLocaleString() : '12,500'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-emerald-500" />
                  Dimensions
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                  {product.widthMm} × {product.heightMm} mm
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  Colors
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                  {product.colorCount || 6} Colors
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-500" />
                  Color Changes / Stops
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                  {product.stopCount || 8} Stops
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Description
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Designer Card */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {product.designerName ? product.designerName.charAt(0) : 'A'}
                </div>
                <div>
                  <div className="text-xs text-slate-400">Designer</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {product.designerName || 'AdhiEMB Master Studio'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Approval Modal */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        title={approvalAction === 'APPROVED' ? 'Approve Design' : 'Reject Design'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {approvalAction === 'APPROVED'
              ? 'Approving this design will publish it live onto the public marketplace for buyers.'
              : 'Please enter a feedback message for the designer explaining why this design was rejected.'}
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
                placeholder="Detail the requested changes..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3 text-sm"
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
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Design"
        message="Are you sure you want to delete this design permanently?"
        confirmLabel="Delete Design"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
