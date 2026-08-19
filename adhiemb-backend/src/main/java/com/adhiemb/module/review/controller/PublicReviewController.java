package com.adhiemb.module.review.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.common.PagedResponse;
import com.adhiemb.module.review.dto.ReviewDTO;
import com.adhiemb.module.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/reviews")
@RequiredArgsConstructor
public class PublicReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ApiResponse<PagedResponse<ReviewDTO>> getProductReviews(
            @PathVariable Long productId,
            Pageable pageable) {
        PagedResponse<ReviewDTO> reviews = reviewService.getProductReviews(productId, pageable);
        return ApiResponse.success("Product reviews retrieved successfully", reviews);
    }
}
