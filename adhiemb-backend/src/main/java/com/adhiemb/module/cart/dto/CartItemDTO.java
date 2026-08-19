package com.adhiemb.module.cart.dto;

import java.math.BigDecimal;

public record CartItemDTO(
    Long id,
    Long productId,
    String productTitle,
    String productSlug,
    BigDecimal price,
    BigDecimal discountPrice,
    String primaryImageUrl,
    Integer quantity,
    BigDecimal itemTotal
) {}
