package com.adhiemb.module.review.service;

import com.adhiemb.common.PagedResponse;
import com.adhiemb.exception.BadRequestException;
import com.adhiemb.exception.ForbiddenException;
import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.order.enums.OrderStatus;
import com.adhiemb.module.order.repository.OrderItemRepository;
import com.adhiemb.module.product.entity.Product;
import com.adhiemb.module.product.repository.ProductRepository;
import com.adhiemb.module.review.dto.CreateReviewRequest;
import com.adhiemb.module.review.dto.ReviewDTO;
import com.adhiemb.module.review.entity.Review;
import com.adhiemb.module.review.enums.ReviewStatus;
import com.adhiemb.module.review.repository.ReviewRepository;
import com.adhiemb.module.user.entity.User;
import com.adhiemb.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ReviewDTO> getProductReviews(Long productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", "id", productId);
        }
        Page<ReviewDTO> page = reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.APPROVED, pageable)
                .map(this::mapToDTO);
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ReviewDTO> getUserReviews(Long userId, Pageable pageable) {
        Page<ReviewDTO> page = reviewRepository.findByUserId(userId, pageable)
                .map(this::mapToDTO);
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ReviewDTO> getAllReviews(ReviewStatus status, Pageable pageable) {
        Page<Review> page;
        if (status != null) {
            page = reviewRepository.findByStatus(status, pageable);
        } else {
            page = reviewRepository.findAll(pageable);
        }
        return PagedResponse.of(page.map(this::mapToDTO));
    }

    @Transactional
    public ReviewDTO createReview(Long userId, CreateReviewRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.productId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (reviewRepository.existsByProductIdAndUserId(request.productId(), userId)) {
            throw new BadRequestException("You have already submitted a review for this product");
        }

        boolean isVerified = orderItemRepository.existsByOrderUserIdAndProductIdAndOrderStatus(
                userId, request.productId(), OrderStatus.PAID
        );

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.rating())
                .title(request.title())
                .comment(request.comment())
                .isVerifiedPurchase(isVerified)
                .status(ReviewStatus.APPROVED)
                .build();

        Review saved = reviewRepository.save(review);
        updateProductRatingStats(product.getId());

        return mapToDTO(saved);
    }

    @Transactional
    public ReviewDTO moderateReview(Long reviewId, ReviewStatus status) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        review.setStatus(status);
        Review updated = reviewRepository.save(review);

        updateProductRatingStats(review.getProduct().getId());

        return mapToDTO(updated);
    }

    @Transactional
    public void deleteReview(Long reviewId, Long currentUserId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!isAdmin && !review.getUser().getId().equals(currentUserId)) {
            throw new ForbiddenException("You are not authorized to delete this review");
        }

        Long productId = review.getProduct().getId();
        reviewRepository.delete(review);

        updateProductRatingStats(productId);
    }

    private void updateProductRatingStats(Long productId) {
        Double avg = reviewRepository.getAverageRatingForProduct(productId);
        Long count = reviewRepository.getApprovedCountForProduct(productId);

        productRepository.findById(productId).ifPresent(product -> {
            product.setRatingAverage(avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            product.setRatingCount(count != null ? count.intValue() : 0);
            productRepository.save(product);
        });
    }

    private ReviewDTO mapToDTO(Review review) {
        String userName = review.getUser() != null ?
                (review.getUser().getFirstName() + " " + (review.getUser().getLastName() != null ? review.getUser().getLastName() : "")).trim()
                : "Anonymous";
        String userAvatar = review.getUser() != null ? review.getUser().getAvatarUrl() : null;
        String productTitle = review.getProduct() != null ? review.getProduct().getTitle() : null;

        return new ReviewDTO(
                review.getId(),
                review.getProduct() != null ? review.getProduct().getId() : null,
                productTitle,
                review.getUser() != null ? review.getUser().getId() : null,
                userName,
                userAvatar,
                review.getRating(),
                review.getTitle(),
                review.getComment(),
                review.getIsVerifiedPurchase(),
                review.getStatus(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
