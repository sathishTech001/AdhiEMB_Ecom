package com.adhiemb.module.auditlog.aspect;

import com.adhiemb.module.auditlog.annotation.Auditable;
import com.adhiemb.module.auditlog.service.AuditLogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    @Around("@annotation(auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        Object result = null;
        String requestParams = null;
        String responseResult = null;
        
        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                try {
                    requestParams = objectMapper.writeValueAsString(args);
                } catch (Exception e) {
                    log.warn("Failed to serialize method arguments for audit", e);
                }
            }

            result = joinPoint.proceed();

            if (result != null) {
                try {
                    responseResult = objectMapper.writeValueAsString(result);
                } catch (Exception e) {
                    log.warn("Failed to serialize method result for audit", e);
                }
            }
            
            HttpServletRequest request = null;
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                request = attributes.getRequest();
            }

            auditLogService.log(
                    auditable.action(),
                    auditable.module(),
                    auditable.entityType(),
                    null, // entityId is hard to extract generically here without parsing response
                    requestParams,
                    responseResult,
                    request
            );

            return result;
        } catch (Throwable e) {
            // Also log failures if needed
            throw e;
        }
    }
}
