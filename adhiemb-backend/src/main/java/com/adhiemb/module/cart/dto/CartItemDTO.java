package com.adhiemb.module.cart.dto;

import java.math.BigDecimal;

public record CartItemDTO(
    Long id,
    Long productId,
    Long productFileId,
    String productTitle,
    String productSlug,
    String fileFormat,
    String originalFileName,
    String machineInfo,
    BigDecimal price,
    BigDecimal discountPrice,
    String primaryImageUrl,
    Integer quantity,
    BigDecimal itemTotal
) {}
