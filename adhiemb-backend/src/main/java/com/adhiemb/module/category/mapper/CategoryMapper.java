package com.adhiemb.module.category.mapper;

import com.adhiemb.module.category.dto.CategoryDTO;
import com.adhiemb.module.category.dto.CategoryTreeDTO;
import com.adhiemb.module.category.dto.CreateCategoryRequest;
import com.adhiemb.module.category.entity.Category;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CategoryMapper {

    private CategoryMapper() {
    }

    public static CategoryDTO toDTO(Category entity) {
        if (entity == null) {
            return null;
        }

        return new CategoryDTO(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getDescription(),
                entity.getImageUrl(),
                entity.getIcon(),
                entity.getParent() != null ? entity.getParent().getId() : null,
                entity.getParent() != null ? entity.getParent().getName() : null,
                entity.getSortOrder(),
                entity.getIsActive()
        );
    }

    public static CategoryTreeDTO toTreeDTO(Category entity) {
        if (entity == null) {
            return null;
        }

        List<CategoryTreeDTO> childDTOs = entity.getChildren() != null
                ? entity.getChildren().stream()
                .map(CategoryMapper::toTreeDTO)
                .collect(Collectors.toList())
                : Collections.emptyList();

        return new CategoryTreeDTO(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getDescription(),
                entity.getImageUrl(),
                entity.getIcon(),
                entity.getSortOrder(),
                entity.getIsActive(),
                childDTOs
        );
    }

    public static CategoryTreeDTO toActiveTreeDTO(Category entity) {
        if (entity == null || Boolean.FALSE.equals(entity.getIsActive())) {
            return null;
        }

        List<CategoryTreeDTO> childDTOs = entity.getChildren() != null
                ? entity.getChildren().stream()
                .filter(c -> Boolean.TRUE.equals(c.getIsActive()))
                .map(CategoryMapper::toActiveTreeDTO)
                .collect(Collectors.toList())
                : Collections.emptyList();

        return new CategoryTreeDTO(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getDescription(),
                entity.getImageUrl(),
                entity.getIcon(),
                entity.getSortOrder(),
                entity.getIsActive(),
                childDTOs
        );
    }

    public static Category toEntity(CreateCategoryRequest request) {
        if (request == null) {
            return null;
        }

        return Category.builder()
                .name(request.name())
                .description(request.description())
                .imageUrl(request.imageUrl())
                .icon(request.icon())
                .sortOrder(request.sortOrder() != null ? request.sortOrder() : 0)
                .isActive(true)
                .build();
    }
}
