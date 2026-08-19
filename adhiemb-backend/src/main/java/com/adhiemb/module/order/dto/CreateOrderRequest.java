package com.adhiemb.module.order.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateOrderRequest(
    @NotBlank(message = "Billing name is required")
    String billingName,

    @NotBlank(message = "Billing email is required")
    @Email(message = "Billing email must be valid")
    String billingEmail,

    String billingPhone,
    String billingAddress,
    String paymentMethod
) {}
