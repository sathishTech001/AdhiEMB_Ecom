package com.adhiemb.module.menu.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.menu.dto.CreateMenuRequest;
import com.adhiemb.module.menu.dto.MenuDTO;
import com.adhiemb.module.menu.dto.MenuTreeDTO;
import com.adhiemb.module.menu.dto.UpdateMenuRequest;
import com.adhiemb.module.menu.service.MenuService;
import com.adhiemb.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    @PreAuthorize("hasAuthority('MENU_VIEW')")
    public ApiResponse<List<MenuDTO>> getAllMenus() {
        return ApiResponse.success(menuService.getAllMenus());
    }

    @GetMapping("/tree")
    @PreAuthorize("hasAuthority('MENU_VIEW')")
    public ApiResponse<List<MenuTreeDTO>> getMenuTree() {
        return ApiResponse.success(menuService.getMenuTree());
    }

    @GetMapping("/my-menus")
    public ApiResponse<List<MenuTreeDTO>> getMyMenus() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(menuService.getMyMenus(userId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MENU_CREATE')")
    public ApiResponse<MenuDTO> createMenu(@Valid @RequestBody CreateMenuRequest request) {
        return ApiResponse.success("Menu created successfully", menuService.createMenu(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_UPDATE')")
    public ApiResponse<MenuDTO> updateMenu(@PathVariable Long id, @Valid @RequestBody UpdateMenuRequest request) {
        return ApiResponse.success("Menu updated successfully", menuService.updateMenu(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_DELETE')")
    public ApiResponse<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return ApiResponse.success("Menu deleted successfully", null);
    }
}
