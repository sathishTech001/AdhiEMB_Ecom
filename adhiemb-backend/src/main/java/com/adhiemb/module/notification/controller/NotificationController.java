package com.adhiemb.module.notification.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.common.PagedResponse;
import com.adhiemb.module.notification.dto.NotificationDTO;
import com.adhiemb.module.notification.service.NotificationService;
import com.adhiemb.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PagedResponse<NotificationDTO>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            Pageable pageable) {
        PagedResponse<NotificationDTO> notifications = notificationService.getUserNotifications(userDetails.getId(), pageable);
        return ApiResponse.success("Notifications retrieved successfully", notifications);
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        long count = notificationService.getUnreadCount(userDetails.getId());
        return ApiResponse.success("Unread notification count retrieved successfully", Map.of("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NotificationDTO> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        NotificationDTO notification = notificationService.markAsRead(id, userDetails.getId());
        return ApiResponse.success("Notification marked as read", notification);
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getId());
        return ApiResponse.success("All notifications marked as read", null);
    }
}
