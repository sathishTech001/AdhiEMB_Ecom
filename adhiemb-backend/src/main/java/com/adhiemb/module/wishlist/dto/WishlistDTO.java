package com.adhiemb.module.wishlist.dto;

import com.adhiemb.module.product.dto.ProductDTO;

import java.time.LocalDateTime;

public record WishlistDTO(
        Long id,
        Long userId,
        ProductDTO product,
        LocalDateTime createdAt
) {
}
