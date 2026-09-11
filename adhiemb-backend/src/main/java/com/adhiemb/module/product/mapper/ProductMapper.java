package com.adhiemb.module.product.mapper;

import com.adhiemb.module.category.mapper.CategoryMapper;
import com.adhiemb.module.product.dto.*;
import com.adhiemb.module.product.entity.Product;
import com.adhiemb.module.product.entity.ProductFileData;
import com.adhiemb.module.product.entity.ProductImage;
import com.adhiemb.module.product.enums.MachineFormat;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ProductMapper {

    private ProductMapper() {
    }

    public static ProductImageDTO toImageDTO(ProductImage image) {
        if (image == null) {
            return null;
        }
        return new ProductImageDTO(
                image.getId(),
                image.getImageUrl(),
                image.getIsPrimary(),
                image.getSortOrder()
        );
    }

    public static ProductFileDTO toFileDTO(ProductFileData file) {
        if (file == null) {
            return null;
        }
        return new ProductFileDTO(
                file.getId(),
                file.getStorageKey(),
                file.getStorageKey(),
                file.getFileFormat(),
                file.getFileSizeBytes(),
                file.getOriginalFileName(),
                file.getMachineInfo(),
                file.getPrice(),
                file.getIsActive()
        );
    }

    public static ProductFileDataDTO toFileDataDTO(ProductFileData file) {
        if (file == null) {
            return null;
        }
        return new ProductFileDataDTO(
                file.getId(),
                file.getOriginalFileName(),
                file.getStorageKey(),
                file.getFileFormat(),
                file.getMachineInfo(),
                file.getPrice(),
                file.getFileSizeBytes(),
                file.getIsActive()
        );
    }

    public static ProductDTO toDTO(Product entity) {
        if (entity == null) {
            return null;
        }

        String primaryImageUrl = null;
        if (entity.getImages() != null && !entity.getImages().isEmpty()) {
            primaryImageUrl = entity.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(entity.getImages().get(0).getImageUrl());
        }

        List<MachineFormat> availableFormats = Collections.emptyList();
        if (entity.getFiles() != null && !entity.getFiles().isEmpty()) {
            availableFormats = entity.getFiles().stream()
                    .map(ProductFileData::getFileFormat)
                    .distinct()
                    .collect(Collectors.toList());
        }

        String designerName = null;
        if (entity.getDesigner() != null) {
            String first = entity.getDesigner().getFirstName();
            String last = entity.getDesigner().getLastName();
            if (org.springframework.util.StringUtils.hasText(first)) {
                designerName = (first + (org.springframework.util.StringUtils.hasText(last) ? " " + last : "")).trim();
            } else if (org.springframework.util.StringUtils.hasText(entity.getDesigner().getUsername())) {
                designerName = entity.getDesigner().getUsername();
            } else {
                designerName = entity.getDesigner().getEmail();
            }
        }

        return new ProductDTO(
                entity.getId(),
                entity.getTitle(),
                entity.getProductCode(),
                entity.getSlug(),
                entity.getDescription(),
                entity.getStitchCount(),
                entity.getWidthMm(),
                entity.getHeightMm(),
                entity.getColorCount(),
                entity.getStopCount(),
                entity.getCategory() != null ? entity.getCategory().getId() : null,
                entity.getCategory() != null ? entity.getCategory().getName() : null,
                entity.getCategory() != null ? entity.getCategory().getSlug() : null,
                entity.getDesignType(),
                entity.getDesigner() != null ? entity.getDesigner().getId() : null,
                designerName,
                entity.getStatus(),
                entity.getRejectionReason(),
                entity.getIsFeatured(),
                entity.getDownloadsCount(),
                entity.getViewCount(),
                entity.getRatingAverage(),
                entity.getRatingCount(),
                primaryImageUrl,
                availableFormats,
                entity.getCreatedAt()
        );
    }

    public static ProductDetailDTO toDetailDTO(Product entity) {
        if (entity == null) {
            return null;
        }

        List<ProductImageDTO> images = entity.getImages() != null
                ? entity.getImages().stream().map(ProductMapper::toImageDTO).collect(Collectors.toList())
                : Collections.emptyList();

        List<ProductFileDTO> files = entity.getFiles() != null
                ? entity.getFiles().stream().map(ProductMapper::toFileDTO).collect(Collectors.toList())
                : Collections.emptyList();

        String designerName = null;
        if (entity.getDesigner() != null) {
            String first = entity.getDesigner().getFirstName();
            String last = entity.getDesigner().getLastName();
            if (org.springframework.util.StringUtils.hasText(first)) {
                designerName = (first + (org.springframework.util.StringUtils.hasText(last) ? " " + last : "")).trim();
            } else if (org.springframework.util.StringUtils.hasText(entity.getDesigner().getUsername())) {
                designerName = entity.getDesigner().getUsername();
            } else {
                designerName = entity.getDesigner().getEmail();
            }
        }

        return new ProductDetailDTO(
                entity.getId(),
                entity.getTitle(),
                entity.getProductCode(),
                entity.getSlug(),
                entity.getDescription(),
                entity.getStitchCount(),
                entity.getWidthMm(),
                entity.getHeightMm(),
                entity.getColorCount(),
                entity.getStopCount(),
                CategoryMapper.toDTO(entity.getCategory()),
                entity.getDesignType(),
                entity.getDesigner() != null ? entity.getDesigner().getId() : null,
                designerName,
                entity.getStatus(),
                entity.getRejectionReason(),
                entity.getIsFeatured(),
                entity.getDownloadsCount(),
                entity.getViewCount(),
                entity.getRatingAverage(),
                entity.getRatingCount(),
                images,
                files,
                entity.getCreatedAt()
        );
    }
}
