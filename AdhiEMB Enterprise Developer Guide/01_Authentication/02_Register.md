# 02 Register — AdhiEMB Enterprise Guide

- **Endpoint**: `POST /api/auth/register`
- **Request**: `{"email":"...", "password":"...", "firstName":"...", "lastName":"...", "username":"..."}`
- **Role**: Automatically assigns default `CUSTOMER` role. Checks email/username uniqueness.
