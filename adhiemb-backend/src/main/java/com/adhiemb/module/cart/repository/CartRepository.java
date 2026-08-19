package com.adhiemb.module.cart.repository;

import com.adhiemb.module.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserId(Long userId);

    Optional<Cart> findBySessionId(String sessionId);

    @Query("SELECT c FROM Cart c WHERE (c.user.id = :userId AND :userId IS NOT NULL) OR (c.sessionId = :sessionId AND :sessionId IS NOT NULL)")
    Optional<Cart> findByUserIdOrSessionId(@Param("userId") Long userId, @Param("sessionId") String sessionId);
}
