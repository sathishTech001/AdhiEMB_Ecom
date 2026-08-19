package com.adhiemb.module.download.entity;

import com.adhiemb.common.BaseEntity;
import com.adhiemb.module.order.entity.Order;
import com.adhiemb.module.product.entity.Product;
import com.adhiemb.module.product.entity.ProductFile;
import com.adhiemb.module.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "download_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DownloadToken extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private ProductFile file;

    @Column(name = "download_count")
    @Builder.Default
    private Integer downloadCount = 0;

    @Column(name = "max_downloads")
    @Builder.Default
    private Integer maxDownloads = 50;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}
