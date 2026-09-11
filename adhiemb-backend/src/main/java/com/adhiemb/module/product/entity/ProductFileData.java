package com.adhiemb.module.product.entity;

import com.adhiemb.common.BaseEntity;
import com.adhiemb.module.product.enums.MachineFormat;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_file_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFileData extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "storage_key", nullable = false, length = 500)
    private String storageKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_format", nullable = false, length = 20)
    private MachineFormat fileFormat;

    @Column(name = "machine_info", length = 150)
    private String machineInfo;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "file_size_bytes")
    @Builder.Default
    private Long fileSizeBytes = 0L;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
