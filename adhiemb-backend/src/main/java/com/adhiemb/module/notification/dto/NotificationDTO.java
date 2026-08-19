package com.adhiemb.module.notification.dto;

import java.time.LocalDateTime;

public record NotificationDTO(
    Long id,
    Long userId,
    String title,
    String message,
    String type,
    String actionLink,
    Boolean isRead,
    LocalDateTime createdAt
) {}
