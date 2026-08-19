package com.adhiemb.module.download.dto;

import java.time.LocalDateTime;

public record DownloadTokenDTO(
    Long id,
    String token,
    Long userId,
    Long orderId,
    String orderNumber,
    Long productId,
    String productTitle,
    Long fileId,
    String fileName,
    String fileFormat,
    Integer downloadCount,
    Integer maxDownloads,
    LocalDateTime expiresAt
) {}
