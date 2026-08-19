package com.adhiemb.storage;

import com.adhiemb.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final StorageService storageService;
    private final FstoreStorageService fstoreStorageService;

    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('PRODUCT_UPLOAD') or isAuthenticated()")
    public ApiResponse<FileUploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "directory", required = false, defaultValue = "products") String directory) {

        String url = fstoreStorageService.storeFileUpload(file, directory);
        String filePath = url.replace("/api/public/files/", "");
        String originalName = file.getOriginalFilename();
        Long size = file.getSize();

        String format = "";
        if (originalName != null && originalName.contains(".")) {
            format = originalName.substring(originalName.lastIndexOf('.') + 1).toUpperCase();
        }

        FileUploadResponse response = new FileUploadResponse(url, filePath, originalName, size, format);
        return ApiResponse.success("File uploaded successfully into fstore", response);
    }

    @PostMapping("/upload-multiple")
    @PreAuthorize("hasAuthority('PRODUCT_UPLOAD') or isAuthenticated()")
    public ApiResponse<List<FileUploadResponse>> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "directory", required = false, defaultValue = "products") String directory) {

        List<FileUploadResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            String url = fstoreStorageService.storeFileUpload(file, directory);
            String filePath = url.replace("/api/public/files/", "");
            String originalName = file.getOriginalFilename();
            Long size = file.getSize();

            String format = "";
            if (originalName != null && originalName.contains(".")) {
                format = originalName.substring(originalName.lastIndexOf('.') + 1).toUpperCase();
            }

            responses.add(new FileUploadResponse(url, filePath, originalName, size, format));
        }

        return ApiResponse.success("Files uploaded successfully into fstore", responses);
    }

    @PostMapping("/ingest-url")
    @PreAuthorize("hasAuthority('PRODUCT_UPLOAD') or isAuthenticated()")
    public ApiResponse<Map<String, String>> ingestExternalImageUrl(
            @RequestBody Map<String, String> body) {
        String imageUrl = body.get("imageUrl");
        String module = body.getOrDefault("module", "products");

        String storedUrl = fstoreStorageService.processImageFromUrlOrUpload(imageUrl, module);
        String relativePath = storedUrl.replace("/api/public/files/", "");

        return ApiResponse.success("Image URL ingested into fstore successfully", Map.of(
                "originalUrl", imageUrl != null ? imageUrl : "",
                "storedUrl", storedUrl,
                "imagePath", relativePath
        ));
    }
}
