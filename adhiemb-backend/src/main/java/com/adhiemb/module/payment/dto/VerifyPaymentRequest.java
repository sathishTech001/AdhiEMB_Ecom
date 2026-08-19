package com.adhiemb.module.payment.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyPaymentRequest(
    @NotBlank(message = "Payment number is required")
    String paymentNumber,

    String gatewayOrderId,
    String gatewayPaymentId,
    String gatewaySignature,
    String status
) {}
