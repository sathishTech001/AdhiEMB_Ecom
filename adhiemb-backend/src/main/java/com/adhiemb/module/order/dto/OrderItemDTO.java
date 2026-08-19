package com.adhiemb.module.order.dto;

import java.math.BigDecimal;

public record OrderItemDTO(
    Long id,
    Long productId,
    String productTitle,
    BigDecimal productPrice,
    String primaryImageUrl
) {}
