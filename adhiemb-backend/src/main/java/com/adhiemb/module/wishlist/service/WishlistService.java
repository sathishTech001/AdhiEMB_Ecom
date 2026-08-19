package com.adhiemb.module.wishlist.service;

import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.product.entity.Product;
import com.adhiemb.module.product.mapper.ProductMapper;
import com.adhiemb.module.product.repository.ProductRepository;
import com.adhiemb.module.user.entity.User;
import com.adhiemb.module.user.repository.UserRepository;
import com.adhiemb.module.wishlist.dto.WishlistDTO;
import com.adhiemb.module.wishlist.entity.Wishlist;
import com.adhiemb.module.wishlist.repository.WishlistRepository;
import com.adhiemb.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WishlistDTO> getUserWishlist() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new ResourceNotFoundException("User", "id", "current");
        }

        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(w -> new WishlistDTO(w.getId(), w.getUser().getId(), ProductMapper.toDTO(w.getProduct()), w.getCreatedAt()))
                .toList();
    }

    @Transactional
    public WishlistDTO addToWishlist(Long productId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new ResourceNotFoundException("User", "id", "current");
        }

        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            Wishlist existing = wishlistRepository.findByUserIdAndProductId(userId, productId).orElseThrow();
            return new WishlistDTO(existing.getId(), userId, ProductMapper.toDTO(existing.getProduct()), existing.getCreatedAt());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (product.getStatus() != com.adhiemb.module.product.enums.ProductStatus.APPROVED) {
            throw new com.adhiemb.exception.BadRequestException("Only approved products can be added to wishlist");
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        wishlist = wishlistRepository.save(wishlist);

        return new WishlistDTO(wishlist.getId(), userId, ProductMapper.toDTO(product), wishlist.getCreatedAt());
    }

    @Transactional
    public void removeFromWishlist(Long productId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new ResourceNotFoundException("User", "id", "current");
        }

        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Transactional(readOnly = true)
    public boolean isInWishlist(Long productId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) return false;
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
}
