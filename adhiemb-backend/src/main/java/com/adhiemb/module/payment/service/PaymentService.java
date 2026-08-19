package com.adhiemb.module.payment.service;

import com.adhiemb.exception.BadRequestException;
import com.adhiemb.exception.ForbiddenException;
import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.download.service.DownloadService;
import com.adhiemb.module.order.entity.Order;
import com.adhiemb.module.order.enums.OrderStatus;
import com.adhiemb.module.order.repository.OrderRepository;
import com.adhiemb.module.payment.dto.InitiatePaymentRequest;
import com.adhiemb.module.payment.dto.PaymentDTO;
import com.adhiemb.module.payment.dto.VerifyPaymentRequest;
import com.adhiemb.module.payment.entity.Payment;
import com.adhiemb.module.payment.enums.PaymentStatus;
import com.adhiemb.module.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final DownloadService downloadService;

    @Transactional
    public PaymentDTO initiatePayment(Long userId, InitiatePaymentRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.orderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Order does not belong to the current user");
        }

        String paymentNumber = "PAY-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String gatewayOrderId = "gtw_ord_" + System.currentTimeMillis();

        Payment payment = Payment.builder()
                .order(order)
                .paymentNumber(paymentNumber)
                .paymentMethod(request.paymentMethod())
                .amount(order.getTotalAmount())
                .currency("USD")
                .gatewayOrderId(gatewayOrderId)
                .status(PaymentStatus.INITIATED)
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        return mapToPaymentDTO(savedPayment);
    }

    @Transactional
    public PaymentDTO verifyPayment(Long userId, VerifyPaymentRequest request) {
        Payment payment = paymentRepository.findByPaymentNumber(request.paymentNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "paymentNumber", request.paymentNumber()));

        Order order = payment.getOrder();
        if (userId != null && !order.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Payment does not belong to the current user");
        }

        String statusStr = request.status() != null ? request.status().toUpperCase() : "SUCCESS";

        if ("SUCCESS".equals(statusStr) || "PAID".equals(statusStr)) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setGatewayPaymentId(request.gatewayPaymentId() != null ? request.gatewayPaymentId() : "gtw_pay_" + System.currentTimeMillis());
            payment.setGatewaySignature(request.gatewaySignature() != null ? request.gatewaySignature() : "sig_" + System.currentTimeMillis());

            order.setStatus(OrderStatus.PAID);
            order.setPaymentStatus(PaymentStatus.SUCCESS);
            orderRepository.save(order);

            // Automatically generate download tokens for the purchased products
            downloadService.generateTokensForOrder(order);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);
        }

        Payment updatedPayment = paymentRepository.save(payment);
        return mapToPaymentDTO(updatedPayment);
    }

    @Transactional
    public void processWebhook(String provider, String payload, String signature) {
        // Mock webhook handler for payment providers (Stripe, Razorpay, etc.)
        if (payload != null && payload.contains("payment_intent.succeeded")) {
            // Find payment by gateway ID if present or parse JSON
            paymentRepository.findAll().stream()
                    .filter(p -> p.getStatus() == PaymentStatus.INITIATED)
                    .findFirst()
                    .ifPresent(payment -> {
                        payment.setStatus(PaymentStatus.SUCCESS);
                        payment.setResponsePayload(payload);
                        paymentRepository.save(payment);

                        Order order = payment.getOrder();
                        order.setStatus(OrderStatus.PAID);
                        order.setPaymentStatus(PaymentStatus.SUCCESS);
                        orderRepository.save(order);

                        downloadService.generateTokensForOrder(order);
                    });
        }
    }

    public PaymentDTO mapToPaymentDTO(Payment payment) {
        return new PaymentDTO(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getOrder().getOrderNumber(),
                payment.getPaymentNumber(),
                payment.getPaymentMethod(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getGatewayOrderId(),
                payment.getGatewayPaymentId(),
                payment.getStatus(),
                payment.getCreatedAt()
        );
    }
}
