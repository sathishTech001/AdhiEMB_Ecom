package com.adhiemb.module.cart.service;

import com.adhiemb.exception.BadRequestException;
import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.cart.dto.AddToCartRequest;
import com.adhiemb.module.cart.dto.CartDTO;
import com.adhiemb.module.cart.dto.CartItemDTO;
import com.adhiemb.module.cart.entity.Cart;
import com.adhiemb.module.cart.entity.CartItem;
import com.adhiemb.module.cart.repository.CartItemRepository;
import com.adhiemb.module.cart.repository.CartRepository;
import com.adhiemb.module.product.entity.Product;
import com.adhiemb.module.product.entity.ProductImage;
import com.adhiemb.module.product.repository.ProductRepository;
import com.adhiemb.module.user.entity.User;
import com.adhiemb.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartDTO getCartForUser(Long userId, String sessionId) {
        Cart cart = getOrCreateCartEntity(userId, sessionId);
        return mapToCartDTO(cart);
    }

    @Transactional
    public CartDTO addToCart(Long userId, String sessionId, AddToCartRequest request) {
        if (request.productId() == null) {
            throw new BadRequestException("Product ID must not be null");
        }

        if (request.quantity() != null && request.quantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.productId()));

        if (product.getStatus() != com.adhiemb.module.product.enums.ProductStatus.APPROVED) {
            throw new BadRequestException("Only approved products can be added to cart");
        }

        Cart cart = getOrCreateCartEntity(userId, sessionId);

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        int quantityToAdd = request.quantity() != null ? request.quantity() : 1;

        if (existingItemOpt.isPresent()) {
            CartItem item = existingItemOpt.get();
            item.setQuantity(item.getQuantity() + quantityToAdd);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantityToAdd)
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return mapToCartDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartDTO updateItemQuantity(Long userId, String sessionId, Long itemId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            return removeFromCart(userId, sessionId, itemId);
        }

        Cart cart = getOrCreateCartEntity(userId, sessionId);
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to the user's cart");
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return mapToCartDTO(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public CartDTO removeFromCart(Long userId, String sessionId, Long itemId) {
        Cart cart = getOrCreateCartEntity(userId, sessionId);
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to the user's cart");
        }

        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        cartItemRepository.delete(cartItem);

        return mapToCartDTO(cartRepository.save(cart));
    }

    @Transactional
    public void clearCart(Long userId, String sessionId) {
        Cart cart = getOrCreateCartEntity(userId, sessionId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Transactional
    public Cart getOrCreateCartEntity(Long userId, String sessionId) {
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

            Optional<Cart> userCartOpt = cartRepository.findByUserId(userId);
            if (userCartOpt.isPresent()) {
                Cart userCart = userCartOpt.get();
                // Merge guest cart if sessionId provided and different
                if (sessionId != null && !sessionId.isBlank()) {
                    Optional<Cart> guestCartOpt = cartRepository.findBySessionId(sessionId);
                    if (guestCartOpt.isPresent() && !guestCartOpt.get().getId().equals(userCart.getId())) {
                        mergeCarts(guestCartOpt.get(), userCart);
                    }
                }
                return userCart;
            } else {
                // If user cart doesn't exist, convert guest cart to user cart or create new
                if (sessionId != null && !sessionId.isBlank()) {
                    Optional<Cart> guestCartOpt = cartRepository.findBySessionId(sessionId);
                    if (guestCartOpt.isPresent()) {
                        Cart guestCart = guestCartOpt.get();
                        guestCart.setUser(user);
                        guestCart.setSessionId(null);
                        return cartRepository.save(guestCart);
                    }
                }
                Cart newCart = Cart.builder()
                        .user(user)
                        .items(new ArrayList<>())
                        .build();
                return cartRepository.save(newCart);
            }
        } else if (sessionId != null && !sessionId.isBlank()) {
            return cartRepository.findBySessionId(sessionId)
                    .orElseGet(() -> cartRepository.save(Cart.builder()
                            .sessionId(sessionId)
                            .items(new ArrayList<>())
                            .build()));
        } else {
            throw new BadRequestException("Either userId or sessionId must be provided for cart operation");
        }
    }

    private void mergeCarts(Cart guestCart, Cart userCart) {
        for (CartItem guestItem : guestCart.getItems()) {
            Optional<CartItem> existingUserItem = cartItemRepository.findByCartIdAndProductId(
                    userCart.getId(), guestItem.getProduct().getId());
            if (existingUserItem.isPresent()) {
                CartItem item = existingUserItem.get();
                item.setQuantity(item.getQuantity() + guestItem.getQuantity());
                cartItemRepository.save(item);
            } else {
                CartItem newItem = CartItem.builder()
                        .cart(userCart)
                        .product(guestItem.getProduct())
                        .quantity(guestItem.getQuantity())
                        .build();
                userCart.getItems().add(newItem);
                cartItemRepository.save(newItem);
            }
        }
        cartRepository.delete(guestCart);
    }

    private CartDTO mapToCartDTO(Cart cart) {
        List<CartItemDTO> itemDTOs = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItems = 0;

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                Product product = item.getProduct();
                BigDecimal effectivePrice = product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                        ? product.getDiscountPrice()
                        : product.getPrice();

                BigDecimal itemTotal = effectivePrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                subtotal = subtotal.add(itemTotal);
                totalItems += item.getQuantity();

                String primaryImageUrl = null;
                if (product.getImages() != null && !product.getImages().isEmpty()) {
                    primaryImageUrl = product.getImages().stream()
                            .filter(ProductImage::getIsPrimary)
                            .map(ProductImage::getImageUrl)
                            .findFirst()
                            .orElse(product.getImages().get(0).getImageUrl());
                }

                itemDTOs.add(new CartItemDTO(
                        item.getId(),
                        product.getId(),
                        product.getTitle(),
                        product.getSlug(),
                        product.getPrice(),
                        product.getDiscountPrice(),
                        primaryImageUrl,
                        item.getQuantity(),
                        itemTotal
                ));
            }
        }

        Long userId = cart.getUser() != null ? cart.getUser().getId() : null;
        return new CartDTO(cart.getId(), userId, cart.getSessionId(), itemDTOs, subtotal, totalItems);
    }
}
