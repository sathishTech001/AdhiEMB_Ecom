package com.adhiemb.storage;

public record FileUploadResponse(
        String url,
        String filePath,
        String originalName,
        Long size,
        String format
) {}
