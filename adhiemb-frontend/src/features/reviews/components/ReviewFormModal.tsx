import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StarRating } from './StarRating';
import { useCreateReview } from '../hooks/useReviews';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';

const reviewSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  comment: z.string().min(10, 'Review comment must be at least 10 characters').max(1000, 'Comment too long'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number | string;
  productName: string;
  onSuccess?: () => void;
}

export function ReviewFormModal({
  isOpen,
  onClose,
  productId,
  productName,
  onSuccess,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const createReview = useCreateReview();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      title: '',
      comment: '',
    },
  });

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (ratingError) setRatingError(null);
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      setRatingError('Please select a star rating');
      return;
    }

    try {
      await createReview.mutateAsync({
        productId,
        rating,
        title: data.title,
        comment: data.comment,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        reset();
        setRating(5);
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error) {
      // Error handled by react-query / global toast
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Write a Product Review" size="lg">
      {submitSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">Review Submitted!</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Thank you for sharing your feedback. Your review has been submitted for moderation.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Reviewing Product
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {productName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <StarRating value={rating} onChange={handleRatingChange} size="lg" showLabel />
            </div>
            {ratingError && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {ratingError}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Review Headline / Summary"
              placeholder="e.g. Beautiful stitching, flawless digitizing!"
              error={errors.title?.message}
              {...register('title')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Detailed Review <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Tell others what you loved about this design, thread quality, format compatibility, etc..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              {...register('comment')}
            />
            {errors.comment && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.comment.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createReview.isPending}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Submit Review
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
