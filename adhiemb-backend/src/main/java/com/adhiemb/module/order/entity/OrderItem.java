package com.adhiemb.module.order.entity;

import com.adhiemb.common.BaseEntity;
import com.adhiemb.module.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_file_id")
    private com.adhiemb.module.product.entity.ProductFileData productFile;

    @Column(name = "product_title", nullable = false)
    private String productTitle;

    @Column(name = "product_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal productPrice;

    @Column(name = "machine_info", length = 150)
    private String machineInfo;

    @Column(name = "file_format", length = 20)
    private String fileFormat;
}
