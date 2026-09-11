package com.adhiemb.module.order.dto;

import java.math.BigDecimal;

public record OrderItemDTO(
    Long id,
    Long productId,
    Long productFileId,
    String productTitle,
    String fileFormat,
    String machineInfo,
    BigDecimal productPrice,
    String primaryImageUrl
) {}
