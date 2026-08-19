package com.adhiemb.module.order.dto;

import com.adhiemb.module.order.enums.OrderStatus;
import com.adhiemb.module.payment.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDTO(
    Long id,
    String orderNumber,
    Long userId,
    String userEmail,
    BigDecimal subtotal,
    BigDecimal discountAmount,
    BigDecimal taxAmount,
    BigDecimal totalAmount,
    OrderStatus status,
    PaymentStatus paymentStatus,
    String paymentMethod,
    String billingName,
    String billingEmail,
    String billingPhone,
    String billingAddress,
    LocalDateTime createdAt,
    List<OrderItemDTO> items
) {}
