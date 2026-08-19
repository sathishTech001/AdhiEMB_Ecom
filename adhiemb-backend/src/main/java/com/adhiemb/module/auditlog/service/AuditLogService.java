package com.adhiemb.module.auditlog.service;

import com.adhiemb.common.PagedResponse;
import com.adhiemb.module.auditlog.entity.AuditLog;
import com.adhiemb.module.auditlog.repository.AuditLogRepository;
import com.adhiemb.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(String action, String module, String entityType, Long entityId, String oldValue, String newValue, HttpServletRequest request) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        String userEmail = SecurityUtils.getCurrentUserEmail();
        
        String ipAddress = null;
        String userAgent = null;
        
        if (request != null) {
            ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress == null) {
                ipAddress = request.getRemoteAddr();
            }
            userAgent = request.getHeader("User-Agent");
        }

        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .userEmail(userEmail)
                .action(action)
                .module(module)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLog> getAuditLogs(Pageable pageable) {
        Page<AuditLog> logs = auditLogRepository.findAll(pageable);
        return PagedResponse.of(logs);
    }
}
