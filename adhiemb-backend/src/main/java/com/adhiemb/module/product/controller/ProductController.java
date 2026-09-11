package com.adhiemb.module.product.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.common.PagedResponse;
import com.adhiemb.module.product.dto.*;
import com.adhiemb.module.product.enums.MachineFormat;
import com.adhiemb.module.product.enums.ProductStatus;
import com.adhiemb.module.product.service.ProductService;
import com.adhiemb.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ApiResponse<PagedResponse<ProductDTO>> getAllProducts(
            Pageable pageable,
            @RequestParam(required = false) ProductStatus status) {
        return ApiResponse.success(productService.getAllProducts(pageable, status));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ApiResponse<PagedResponse<ProductDTO>> getMyProducts(
            Pageable pageable,
            @RequestParam(required = false) ProductStatus status) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(productService.getProductsForDesigner(currentUserId, pageable, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ApiResponse<ProductDetailDTO> getProductById(@PathVariable Long id) {
        return ApiResponse.success(productService.getProductById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PRODUCT_CREATE')")
    public ApiResponse<ProductDetailDTO> createProduct(@Valid @RequestBody CreateProductRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success("Product created successfully", productService.createProduct(request, currentUserId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    public ApiResponse<ProductDetailDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success("Product updated successfully", productService.updateProduct(id, request, currentUserId));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    public ApiResponse<ProductDetailDTO> submitForApproval(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success("Product submitted for approval", productService.submitForApproval(id, currentUserId));
    }

    @PostMapping(value = {"/{id}/approval", "/{id}/approve"})
    @PreAuthorize("hasAuthority('PRODUCT_APPROVE')")
    public ApiResponse<ProductDetailDTO> approveOrRejectProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductApprovalRequest request) {
        return ApiResponse.success("Product approval status updated", productService.approveOrRejectProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_DELETE')")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        productService.deleteProduct(id, currentUserId);
        return ApiResponse.success("Product deleted successfully", null);
    }

    @PostMapping("/{id}/files")
    @PreAuthorize("hasAuthority('PRODUCT_UPLOAD')")
    public ApiResponse<ProductFileDTO> attachFileToProduct(
            @PathVariable Long id,
            @RequestParam String filePath,
            @RequestParam MachineFormat format,
            @RequestParam(required = false) Long fileSize,
            @RequestParam(required = false) String originalName) {
        return ApiResponse.success("File attached to product successfully",
                productService.attachFileToProduct(id, filePath, format, fileSize, originalName));
    }

    @PostMapping("/{id}/images")
    @PreAuthorize("hasAuthority('PRODUCT_UPLOAD')")
    public ApiResponse<ProductImageDTO> attachImageToProduct(
            @PathVariable Long id,
            @RequestParam String imageUrl,
            @RequestParam(defaultValue = "false") boolean isPrimary) {
        return ApiResponse.success("Image attached to product successfully",
                productService.attachImageToProduct(id, imageUrl, isPrimary));
    }
}
