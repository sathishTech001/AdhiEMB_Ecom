package com.adhiemb.module.order.service;

import com.adhiemb.common.PagedResponse;
import com.adhiemb.exception.BadRequestException;
import com.adhiemb.exception.ForbiddenException;
import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.cart.entity.Cart;
import com.adhiemb.module.cart.entity.CartItem;
import com.adhiemb.module.cart.service.CartService;
import com.adhiemb.module.order.dto.CreateOrderRequest;
import com.adhiemb.module.order.dto.OrderDTO;
import com.adhiemb.module.order.dto.OrderItemDTO;
import com.adhiemb.module.order.entity.Order;
import com.adhiemb.module.order.entity.OrderItem;
import com.adhiemb.module.order.enums.OrderStatus;
import com.adhiemb.module.order.repository.OrderItemRepository;
import com.adhiemb.module.order.repository.OrderRepository;
import com.adhiemb.module.payment.enums.PaymentStatus;
import com.adhiemb.module.product.entity.Product;
import com.adhiemb.module.product.entity.ProductImage;
import com.adhiemb.module.user.entity.User;
import com.adhiemb.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartService cartService;
    private final UserRepository userRepository;

    @Transactional
    public OrderDTO createOrderFromCart(Long userId, String sessionId, CreateOrderRequest request) {
        if (userId == null) {
            throw new BadRequestException("User must be authenticated to create an order");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartService.getOrCreateCartEntity(userId, sessionId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot create order from an empty cart");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.INITIATED)
                .paymentMethod(request.paymentMethod() != null ? request.paymentMethod() : "MOCK_TEST")
                .billingName(request.billingName())
                .billingEmail(request.billingEmail())
                .billingPhone(request.billingPhone())
                .billingAddress(request.billingAddress())
                .discountAmount(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            com.adhiemb.module.product.entity.ProductFileData file = cartItem.getProductFile();

            BigDecimal price = file != null && file.getPrice() != null ? file.getPrice() : BigDecimal.ZERO;

            subtotal = subtotal.add(price.multiply(BigDecimal.valueOf(cartItem.getQuantity())));

            String title = product.getTitle();
            if (file != null) {
                String extra = file.getMachineInfo() != null ? file.getMachineInfo() + " (" + file.getFileFormat() + ")" : file.getFileFormat().name();
                title = title + " - " + extra;
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productFile(file)
                    .productTitle(title)
                    .productPrice(price)
                    .machineInfo(file != null ? file.getMachineInfo() : null)
                    .fileFormat(file != null && file.getFileFormat() != null ? file.getFileFormat().name() : null)
                    .build();
            orderItems.add(orderItem);
        }

        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal);
        order.getItems().addAll(orderItems);

        Order savedOrder = orderRepository.save(order);

        cartService.clearCart(userId, sessionId);

        return mapToOrderDTO(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderByNumber(String orderNumber, Long currentUserId, boolean isAdmin) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));

        if (!isAdmin && !order.getUser().getId().equals(currentUserId)) {
            throw new ForbiddenException("You do not have permission to view this order");
        }

        return mapToOrderDTO(order);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderDTO> getUserOrders(Long userId, Pageable pageable) {
        Page<Order> orderPage = orderRepository.findByUserId(userId, pageable);
        Page<OrderDTO> dtoPage = orderPage.map(this::mapToOrderDTO);
        return PagedResponse.of(dtoPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderDTO> getAllOrdersAdmin(OrderStatus status, Pageable pageable) {
        Page<Order> orderPage = (status != null)
                ? orderRepository.findByStatus(status, pageable)
                : orderRepository.findAll(pageable);
        Page<OrderDTO> dtoPage = orderPage.map(this::mapToOrderDTO);
        return PagedResponse.of(dtoPage);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setStatus(status);
        if (status == OrderStatus.PAID || status == OrderStatus.COMPLETED) {
            order.setPaymentStatus(PaymentStatus.SUCCESS);
        }
        Order updatedOrder = orderRepository.save(order);
        return mapToOrderDTO(updatedOrder);
    }

    private String generateOrderNumber() {
        int year = Year.now().getValue();
        long randomPart = (long) (Math.random() * 900000L) + 100000L;
        return "EMB-" + year + "-" + randomPart;
    }

    public OrderDTO mapToOrderDTO(Order order) {
        List<OrderItemDTO> itemDTOs = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                String primaryImageUrl = null;
                if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
                    primaryImageUrl = product.getImages().stream()
                            .filter(ProductImage::getIsPrimary)
                            .map(ProductImage::getImageUrl)
                            .findFirst()
                            .orElse(product.getImages().get(0).getImageUrl());
                }

                itemDTOs.add(new OrderItemDTO(
                        item.getId(),
                        product != null ? product.getId() : null,
                        item.getProductFile() != null ? item.getProductFile().getId() : null,
                        item.getProductTitle(),
                        item.getFileFormat(),
                        item.getMachineInfo(),
                        item.getProductPrice(),
                        primaryImageUrl
                ));
            }
        }

        return new OrderDTO(
                order.getId(),
                order.getOrderNumber(),
                order.getUser() != null ? order.getUser().getId() : null,
                order.getUser() != null ? order.getUser().getEmail() : null,
                order.getSubtotal(),
                order.getDiscountAmount(),
                order.getTaxAmount(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getPaymentMethod(),
                order.getBillingName(),
                order.getBillingEmail(),
                order.getBillingPhone(),
                order.getBillingAddress(),
                order.getCreatedAt(),
                itemDTOs
        );
    }
}
