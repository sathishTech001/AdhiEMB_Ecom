package com.adhiemb.module.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartDTO(
    Long id,
    Long userId,
    String sessionId,
    List<CartItemDTO> items,
    BigDecimal subtotal,
    Integer totalItems
) {}
