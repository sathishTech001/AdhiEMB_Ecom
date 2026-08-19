package com.adhiemb.module.product.dto;

public record ProductImageDTO(
        Long id,
        String imageUrl,
        Boolean isPrimary,
        Integer sortOrder
) {}
