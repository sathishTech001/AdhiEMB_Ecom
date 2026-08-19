package com.adhiemb.module.auth.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.auth.dto.AuthResponse;
import com.adhiemb.module.auth.dto.LoginRequest;
import com.adhiemb.module.auth.dto.RegisterRequest;
import com.adhiemb.module.auth.service.AuthService;
import com.adhiemb.module.user.dto.UserDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Login successful", authService.login(request));
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Registration successful", authService.register(request));
    }

    @GetMapping("/me")
    public ApiResponse<UserDTO> getCurrentUser() {
        return ApiResponse.success(authService.me());
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        // Since we are using stateless JWT, we can't truly invalidate it server-side without a blocklist.
        // The client should remove the token.
        return ApiResponse.success("Logout successful", null);
    }
}
