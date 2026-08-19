package com.adhiemb.module.payment.dto;

import com.adhiemb.module.payment.enums.PaymentMethod;
import com.adhiemb.module.payment.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentDTO(
    Long id,
    Long orderId,
    String orderNumber,
    String paymentNumber,
    PaymentMethod paymentMethod,
    BigDecimal amount,
    String currency,
    String gatewayOrderId,
    String gatewayPaymentId,
    PaymentStatus status,
    LocalDateTime createdAt
) {}
