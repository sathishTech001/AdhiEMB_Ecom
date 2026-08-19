package com.adhiemb.module.product.dto;

import com.adhiemb.module.product.enums.ProductStatus;
import jakarta.validation.constraints.NotNull;

public record ProductApprovalRequest(
        @NotNull(message = "Product status is required")
        ProductStatus status,
        String rejectionReason
) {}
