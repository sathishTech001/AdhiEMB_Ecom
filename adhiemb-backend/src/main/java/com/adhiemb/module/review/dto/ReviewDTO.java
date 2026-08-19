package com.adhiemb.module.review.dto;

import com.adhiemb.module.review.enums.ReviewStatus;

import java.time.LocalDateTime;

public record ReviewDTO(
    Long id,
    Long productId,
    String productTitle,
    Long userId,
    String userName,
    String userAvatar,
    Integer rating,
    String title,
    String comment,
    Boolean isVerifiedPurchase,
    ReviewStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
