# 01 Login — AdhiEMB Enterprise Guide

- **Endpoint**: `POST /api/auth/login`
- **Request**: `{"email":"...", "password":"..."}`
- **Response**: `{"accessToken":"...", "tokenType":"Bearer", "user":{...}}`
- **Security**: Password match via `PasswordEncoder.matches()`. BCrypt hash.
