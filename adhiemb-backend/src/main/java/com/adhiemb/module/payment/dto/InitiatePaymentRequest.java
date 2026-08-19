package com.adhiemb.module.payment.dto;

import com.adhiemb.module.payment.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record InitiatePaymentRequest(
    @NotNull(message = "Order ID is required")
    Long orderId,

    @NotNull(message = "Payment method is required")
    PaymentMethod paymentMethod
) {}
