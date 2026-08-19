import { useState } from 'react';
import { 
  Star, 
  Trash2, 
  Check, 
  X, 
  Search, 
  BadgeCheck, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useAdminReviews, useModerateReview, useDeleteReview } from '../hooks/useReviews';
import { ReviewStatus, Review } from '../types/review.types';
import { StarRating } from '../components/StarRating';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageLoader } from '@/components/feedback/PageLoader';
import { EmptyState } from '@/components/ui/EmptyState';

const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 101,
    productName: 'Royal Peacock Zari Embroidery Motif',
    productImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
    userName: 'Ananya Sharma',
    userEmail: 'ananya.s@example.com',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5,
    title: 'Extremely high stitch density and crisp details!',
    comment: 'Downloaded DST & EMB formats. Ran on my Tajima 12-needle machine without a single thread break. Customer was thrilled with the wedding lehenga motif!',
    status: 'PENDING',
    isVerifiedBuyer: true,
    createdAt: '2026-07-19T10:30:00Z',
  },
  {
    id: 'rev-2',
    productId: 102,
    productName: 'Traditional Floral Border Neck Line',
    productImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&q=80',
    userName: 'Rajesh Patel',
    userEmail: 'rajesh.p@example.com',
    rating: 4,
    title: 'Great design, minor resizing needed for small hoop',
    comment: 'The stitch sequence is logically ordered. Metallic gold thread ran smoothly. Would love a smaller hoop version in the bundle.',
    status: 'APPROVED',
    isVerifiedBuyer: true,
    createdAt: '2026-07-18T14:15:00Z',
  },
  {
    id: 'rev-3',
    productId: 103,
    productName: 'Modern Geometrics Blouse Pattern',
    productImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&q=80',
    userName: 'Vikram Singh',
    userEmail: 'vikram.singh@example.com',
    rating: 1,
    title: 'Irrelevant review spam',
    comment: 'Please check my website for promo codes and discounts click here www.spam-site.test',
    status: 'REJECTED',
    isVerifiedBuyer: false,
    createdAt: '2026-07-17T09:00:00Z',
  },
  {
    id: 'rev-4',
    productId: 104,
    productName: 'Ornate Elephant Royal Procession',
    productImage: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&q=80',
    userName: 'Priya Verma',
    userEmail: 'priya.v@example.com',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    rating: 5,
    title: 'Breathtaking embroidery file!',
    comment: 'Used on velvet Sherwani panel. The shading and gradient fills are masterfully digitized. Highly recommended boutique design.',
    status: 'PENDING',
    isVerifiedBuyer: true,
    createdAt: '2026-07-16T18:45:00Z',
  },
];

export function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<ReviewStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  const { data, isLoading } = useAdminReviews({ status: activeTab, search: searchTerm });
  const moderateMutation = useModerateReview();
  const deleteMutation = useDeleteReview();

  const reviewsList = data?.data?.content && data.data.content.length > 0 
    ? data.data.content 
    : MOCK_REVIEWS;

  const filteredReviews = reviewsList.filter((item) => {
    const matchesTab = activeTab === 'ALL' || item.status === activeTab;
    const matchesSearch =
      !searchTerm ||
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleModerate = async (id: number | string, status: ReviewStatus) => {
    try {
      await moderateMutation.mutateAsync({ id, status });
    } catch {
      // handled
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending Moderation</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
    }
  };

  const counts = {
    ALL: reviewsList.length,
    PENDING: reviewsList.filter((r) => r.status === 'PENDING').length,
    APPROVED: reviewsList.filter((r) => r.status === 'APPROVED').length,
    REJECTED: reviewsList.filter((r) => r.status === 'REJECTED').length,
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Customer Reviews
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Sparkles className="h-3 w-3" /> Moderation Hub
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Moderate, approve, and manage customer product ratings & feedback
          </p>
        </div>
      </div>

      {/* Controls Header: Tabs + Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 dark:bg-indigo-500'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab === 'ALL' ? 'All Reviews' : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by customer, product or text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            className="h-10 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-12 w-12 text-slate-400" />}
          title="No Reviews Found"
          description={
            searchTerm
              ? `No reviews matching "${searchTerm}" under ${activeTab.toLowerCase()} status.`
              : 'There are currently no customer reviews in this tab.'
          }
        />
      ) : (
        <div className="grid gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 transition-all hover:shadow-md dark:bg-slate-900 dark:ring-slate-800"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Left Side: Product thumbnail & User info */}
                <div className="flex items-start gap-4 flex-1">
                  {review.productImage ? (
                    <img
                      src={review.productImage}
                      alt={review.productName || 'Product'}
                      className="h-20 w-20 flex-shrink-0 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                    />
                  ) : (
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <Star className="h-8 w-8" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {review.productName || `Product #${review.productId}`}
                      </span>
                      {getStatusBadge(review.status)}
                      {review.isVerifiedBuyer && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <BadgeCheck className="h-3.5 w-3.5" /> Verified Buyer
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {review.userAvatar ? (
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                            {review.userName.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {review.userName}
                        </span>
                      </div>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <StarRating value={review.rating} readOnly size="sm" showLabel />

                    {review.title && (
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {review.title}
                      </h4>
                    )}

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                      "{review.comment}"
                    </p>
                  </div>
                </div>

                {/* Right Side: Quick Action Buttons */}
                <div className="flex items-center gap-2 self-end lg:self-start border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                  {review.status !== 'APPROVED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleModerate(review.id, 'APPROVED')}
                      isLoading={moderateMutation.isPending}
                      leftIcon={<Check className="h-4 w-4" />}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Approve
                    </Button>
                  )}

                  {review.status !== 'REJECTED' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleModerate(review.id, 'REJECTED')}
                      isLoading={moderateMutation.isPending}
                      leftIcon={<X className="h-4 w-4" />}
                      className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      Reject
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(review.id)}
                    leftIcon={<Trash2 className="h-4 w-4 text-rose-500" />}
                    className="hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/40"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Review"
        message="Are you sure you want to delete this review permanently? This action cannot be undone."
        confirmText="Delete Review"
        isDanger={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
