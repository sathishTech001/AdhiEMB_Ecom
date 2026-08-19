package com.adhiemb.module.payment.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.payment.dto.InitiatePaymentRequest;
import com.adhiemb.module.payment.dto.PaymentDTO;
import com.adhiemb.module.payment.dto.VerifyPaymentRequest;
import com.adhiemb.module.payment.service.PaymentService;
import com.adhiemb.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PaymentDTO> initiatePayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody InitiatePaymentRequest request) {
        PaymentDTO payment = paymentService.initiatePayment(userDetails.getId(), request);
        return ApiResponse.success("Payment initiated successfully", payment);
    }

    @PostMapping("/verify")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PaymentDTO> verifyPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody VerifyPaymentRequest request) {
        PaymentDTO payment = paymentService.verifyPayment(userDetails.getId(), request);
        return ApiResponse.success("Payment verified successfully", payment);
    }

    @PostMapping("/webhook/{provider}")
    public ApiResponse<Void> handleWebhook(
            @PathVariable String provider,
            @RequestBody(required = false) String payload,
            @RequestHeader(value = "X-Signature", required = false) String signature) {
        paymentService.processWebhook(provider, payload, signature);
        return ApiResponse.success("Webhook processed successfully", null);
    }
}
