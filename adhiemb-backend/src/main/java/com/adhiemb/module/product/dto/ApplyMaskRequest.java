package com.adhiemb.module.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplyMaskRequest {
    private String originalImageUrl;
    private String originalImageBase64;
    private String maskImageBase64;
    private Integer inpaintRadius;
    private String fileName;
}
