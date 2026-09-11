package com.adhiemb.module.cart.repository;

import com.adhiemb.module.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    Optional<CartItem> findByCartIdAndProductIdAndProductFileId(Long cartId, Long productId, Long productFileId);

    Optional<CartItem> findByCartIdAndProductIdAndProductFileIsNull(Long cartId, Long productId);

    void deleteByCartId(Long cartId);
}
