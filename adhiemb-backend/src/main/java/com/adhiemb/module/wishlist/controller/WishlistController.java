package com.adhiemb.module.wishlist.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.wishlist.dto.WishlistDTO;
import com.adhiemb.module.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ApiResponse<List<WishlistDTO>> getUserWishlist() {
        return ApiResponse.success(wishlistService.getUserWishlist());
    }

    @PostMapping("/{productId}")
    public ApiResponse<WishlistDTO> addToWishlist(@PathVariable Long productId) {
        return ApiResponse.success("Added to wishlist", wishlistService.addToWishlist(productId));
    }

    @DeleteMapping("/{productId}")
    public ApiResponse<Void> removeFromWishlist(@PathVariable Long productId) {
        wishlistService.removeFromWishlist(productId);
        return ApiResponse.success("Removed from wishlist", null);
    }

    @GetMapping("/check/{productId}")
    public ApiResponse<Boolean> checkWishlist(@PathVariable Long productId) {
        return ApiResponse.success(wishlistService.isInWishlist(productId));
    }
}
