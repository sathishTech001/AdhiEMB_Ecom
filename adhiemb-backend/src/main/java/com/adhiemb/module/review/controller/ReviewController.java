package com.adhiemb.module.review.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.common.PagedResponse;
import com.adhiemb.module.review.dto.CreateReviewRequest;
import com.adhiemb.module.review.dto.ReviewDTO;
import com.adhiemb.module.review.enums.ReviewStatus;
import com.adhiemb.module.review.service.ReviewService;
import com.adhiemb.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ReviewDTO> createReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewDTO review = reviewService.createReview(userDetails.getId(), request);
        return ApiResponse.success("Review submitted successfully", review);
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PagedResponse<ReviewDTO>> getMyReviews(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            Pageable pageable) {
        PagedResponse<ReviewDTO> reviews = reviewService.getUserReviews(userDetails.getId(), pageable);
        return ApiResponse.success("User reviews retrieved successfully", reviews);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("REVIEW_MANAGE") || a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_OWNER"));
        reviewService.deleteReview(id, userDetails.getId(), isAdmin);
        return ApiResponse.success("Review deleted successfully", null);
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('REVIEW_MANAGE')")
    public ApiResponse<PagedResponse<ReviewDTO>> getAllReviewsAdmin(
            @RequestParam(required = false) ReviewStatus status,
            Pageable pageable) {
        PagedResponse<ReviewDTO> reviews = reviewService.getAllReviews(status, pageable);
        return ApiResponse.success("All reviews retrieved successfully", reviews);
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasAuthority('REVIEW_MANAGE')")
    public ApiResponse<ReviewDTO> moderateReview(
            @PathVariable Long id,
            @RequestParam ReviewStatus status) {
        ReviewDTO review = reviewService.moderateReview(id, status);
        return ApiResponse.success("Review status updated successfully", review);
    }
}
