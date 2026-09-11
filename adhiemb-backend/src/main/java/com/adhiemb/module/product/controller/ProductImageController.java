package com.adhiemb.module.product.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.product.dto.ApplyMaskRequest;
import com.adhiemb.module.product.dto.MaskedImageResponse;
import com.adhiemb.module.product.service.ImageInpaintingService;
import com.adhiemb.storage.FstoreStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/products/images")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Product Image Mask Editor", description = "Endpoints for uploading, editing, and masking product images")
public class ProductImageController {

    private final FstoreStorageService storageService;
    private final ImageInpaintingService inpaintingService;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload raw product image")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        String url = storageService.storeFileUpload(file, "products");
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", Map.of(
                "url", url,
                "originalFilename", file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.png",
                "size", file.getSize()
        )));
    }

    @PostMapping("/mask/apply")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Apply mask and inpaint/remove unwanted areas from product image")
    public ResponseEntity<ApiResponse<MaskedImageResponse>> applyMask(
            @RequestBody ApplyMaskRequest request) {
        MaskedImageResponse response = inpaintingService.applyMaskAndInpaint(request);
        return ResponseEntity.ok(ApiResponse.success("Mask applied successfully", response));
    }
}
