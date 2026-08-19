package com.adhiemb.module.download.dto;

import java.time.LocalDateTime;
import java.util.List;

public record UserDownloadDTO(
    Long productId,
    String productTitle,
    String productSlug,
    String primaryImageUrl,
    String orderNumber,
    LocalDateTime purchasedAt,
    List<DownloadTokenDTO> tokens
) {}
