package com.adhiemb.module.cart.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.cart.dto.AddToCartRequest;
import com.adhiemb.module.cart.dto.CartDTO;
import com.adhiemb.module.cart.service.CartService;
import com.adhiemb.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartDTO> getCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        CartDTO cart = cartService.getCartForUser(userId, sessionId);
        return ApiResponse.success("Cart retrieved successfully", cart);
    }

    @PostMapping("/items")
    public ApiResponse<CartDTO> addToCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody AddToCartRequest request) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        CartDTO cart = cartService.addToCart(userId, sessionId, request);
        return ApiResponse.success("Item added to cart successfully", cart);
    }

    @PutMapping("/items/{itemId}")
    public ApiResponse<CartDTO> updateItemQuantity(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        CartDTO cart = cartService.updateItemQuantity(userId, sessionId, itemId, quantity);
        return ApiResponse.success("Cart item updated successfully", cart);
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse<CartDTO> removeFromCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable Long itemId) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        CartDTO cart = cartService.removeFromCart(userId, sessionId, itemId);
        return ApiResponse.success("Item removed from cart successfully", cart);
    }

    @DeleteMapping
    public ApiResponse<Void> clearCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        cartService.clearCart(userId, sessionId);
        return ApiResponse.success("Cart cleared successfully", null);
    }
}
