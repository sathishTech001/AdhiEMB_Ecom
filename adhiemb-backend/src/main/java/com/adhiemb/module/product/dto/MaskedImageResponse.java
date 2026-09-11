package com.adhiemb.module.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaskedImageResponse {
    private String originalImageUrl;
    private String maskedImageUrl;
    private String maskOverlayUrl;
    private Integer width;
    private Integer height;
    private Long fileSizeBytes;
    private String message;
}
