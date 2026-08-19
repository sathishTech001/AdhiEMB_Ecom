package com.adhiemb.module.order.repository;

import com.adhiemb.module.order.entity.OrderItem;
import com.adhiemb.module.order.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    boolean existsByOrderUserIdAndProductIdAndOrderStatus(Long userId, Long productId, OrderStatus status);
}

