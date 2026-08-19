package com.adhiemb.module.order.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.common.PagedResponse;
import com.adhiemb.module.order.dto.CreateOrderRequest;
import com.adhiemb.module.order.dto.OrderDTO;
import com.adhiemb.module.order.enums.OrderStatus;
import com.adhiemb.module.order.service.OrderService;
import com.adhiemb.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<OrderDTO> createOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderDTO order = orderService.createOrderFromCart(userDetails.getId(), sessionId, request);
        return ApiResponse.success("Order created successfully", order);
    }

    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PagedResponse<OrderDTO>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            Pageable pageable) {
        PagedResponse<OrderDTO> orders = orderService.getUserOrders(userDetails.getId(), pageable);
        return ApiResponse.success("User orders retrieved successfully", orders);
    }

    @GetMapping("/{orderNumber}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<OrderDTO> getOrderByNumber(
            @PathVariable String orderNumber,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ORDER_VIEW") || a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_OWNER"));
        OrderDTO order = orderService.getOrderByNumber(orderNumber, userDetails.getId(), isAdmin);
        return ApiResponse.success("Order details retrieved successfully", order);
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    public ApiResponse<PagedResponse<OrderDTO>> getAllOrdersAdmin(
            @RequestParam(required = false) OrderStatus status,
            Pageable pageable) {
        PagedResponse<OrderDTO> orders = orderService.getAllOrdersAdmin(status, pageable);
        return ApiResponse.success("All orders retrieved successfully", orders);
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ApiResponse<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        OrderDTO order = orderService.updateOrderStatus(id, status);
        return ApiResponse.success("Order status updated successfully", order);
    }
}
