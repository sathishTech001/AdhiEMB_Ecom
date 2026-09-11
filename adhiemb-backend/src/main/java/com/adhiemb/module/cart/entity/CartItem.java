package com.adhiemb.module.cart.entity;

import com.adhiemb.common.BaseEntity;
import com.adhiemb.module.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_file_id")
    private com.adhiemb.module.product.entity.ProductFileData productFile;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;
}
