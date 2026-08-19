# 03 JWT Authentication — AdhiEMB Enterprise Guide

- **Algorithm**: HMAC-SHA256
- **Header Format**: `Authorization: Bearer <token>`
- **Filter**: `JwtAuthenticationFilter` intercepts requests, extracts user claims, and sets `SecurityContextHolder`.
