package com.adhiemb.module.product.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.common.PagedResponse;
import com.adhiemb.module.product.dto.ProductDTO;
import com.adhiemb.module.product.dto.ProductDetailDTO;
import com.adhiemb.module.product.dto.ProductFilterRequest;
import com.adhiemb.module.product.enums.MachineFormat;
import com.adhiemb.module.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/public/products")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService productService;

    @GetMapping({"", "/search"})
    public ApiResponse<PagedResponse<ProductDTO>> searchPublicProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String designType,
            @RequestParam(required = false) MachineFormat format,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minStitch,
            @RequestParam(required = false) Integer maxStitch,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection,
            Pageable pageable) {

        ProductFilterRequest filter = new ProductFilterRequest(
                search, categoryId, categorySlug, designType, format, minPrice, maxPrice, minStitch, maxStitch, featured, sortBy, sortDirection
        );

        return ApiResponse.success(productService.searchPublicProducts(filter, pageable));
    }

    @GetMapping("/featured")
    public ApiResponse<PagedResponse<ProductDTO>> getFeaturedProducts(Pageable pageable) {
        return ApiResponse.success(productService.getFeaturedProducts(pageable));
    }

    @GetMapping("/categories/{categorySlug}")
    public ApiResponse<PagedResponse<ProductDTO>> getProductsByCategory(
            @PathVariable String categorySlug,
            Pageable pageable) {
        return ApiResponse.success(productService.getProductsByCategorySlug(categorySlug, pageable));
    }

    @GetMapping({"/{slug}", "/slug/{slug}"})
    public ApiResponse<ProductDetailDTO> getProductBySlug(@PathVariable String slug) {
        return ApiResponse.success(productService.getProductBySlug(slug));
    }
}
