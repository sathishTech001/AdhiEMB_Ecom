package com.adhiemb.module.product.entity;

import com.adhiemb.common.BaseEntity;
import com.adhiemb.module.product.enums.MachineFormat;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFile extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_format", nullable = false, length = 20)
    private MachineFormat fileFormat;

    @Column(name = "file_size_bytes")
    @Builder.Default
    private Long fileSizeBytes = 0L;

    @Column(name = "original_file_name")
    private String originalFileName;
}
