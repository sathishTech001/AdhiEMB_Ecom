export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: number | string;
  productId: number | string;
  productName?: string;
  productImage?: string;
  userId?: number | string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  status: ReviewStatus;
  isVerifiedBuyer: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewData {
  productId: number | string;
  rating: number;
  title?: string;
  comment: string;
}

export interface ReviewFilters {
  status?: ReviewStatus | 'ALL';
  productId?: number | string;
  page?: number;
  size?: number;
  search?: string;
}
