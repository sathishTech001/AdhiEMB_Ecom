package com.adhiemb.module.auditlog.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.common.PagedResponse;
import com.adhiemb.module.auditlog.entity.AuditLog;
import com.adhiemb.module.auditlog.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_OWNER', 'ROLE_ADMIN', 'AUDIT_VIEW')")
    public ApiResponse<PagedResponse<AuditLog>> getAuditLogs(Pageable pageable) {
        return ApiResponse.success(auditLogService.getAuditLogs(pageable));
    }
}
