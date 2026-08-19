package com.adhiemb.module.menu.service;

import com.adhiemb.exception.DuplicateResourceException;
import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.menu.dto.CreateMenuRequest;
import com.adhiemb.module.menu.dto.MenuDTO;
import com.adhiemb.module.menu.dto.MenuTreeDTO;
import com.adhiemb.module.menu.dto.UpdateMenuRequest;
import com.adhiemb.module.menu.entity.Menu;
import com.adhiemb.module.menu.mapper.MenuMapper;
import com.adhiemb.module.menu.repository.MenuRepository;
import com.adhiemb.module.role.entity.Role;
import com.adhiemb.module.user.entity.User;
import com.adhiemb.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MenuDTO> getAllMenus() {
        return menuRepository.findAll().stream()
                .map(MenuMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MenuTreeDTO> getMenuTree() {
        return menuRepository.findByParentIsNullOrderBySortOrder().stream()
                .map(MenuMapper::toTreeDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MenuTreeDTO> getMyMenus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Role role = user.getRole();
        if (role == null || role.getMenus() == null || role.getMenus().isEmpty()) {
            return List.of();
        }

        Set<Long> allowedMenuIds = role.getMenus().stream()
                .map(Menu::getId)
                .collect(Collectors.toSet());

        List<Menu> allRootMenus = menuRepository.findByParentIsNullOrderBySortOrder();
        
        return allRootMenus.stream()
                .filter(menu -> allowedMenuIds.contains(menu.getId()) || hasAllowedChild(menu, allowedMenuIds))
                .map(menu -> filterMenuTree(menu, allowedMenuIds))
                .toList();
    }

    private boolean hasAllowedChild(Menu menu, Set<Long> allowedMenuIds) {
        if (menu.getChildren() == null || menu.getChildren().isEmpty()) {
            return false;
        }
        for (Menu child : menu.getChildren()) {
            if (allowedMenuIds.contains(child.getId()) || hasAllowedChild(child, allowedMenuIds)) {
                return true;
            }
        }
        return false;
    }

    private MenuTreeDTO filterMenuTree(Menu menu, Set<Long> allowedMenuIds) {
        List<MenuTreeDTO> children = List.of();
        if (menu.getChildren() != null) {
            children = menu.getChildren().stream()
                    .filter(child -> allowedMenuIds.contains(child.getId()) || hasAllowedChild(child, allowedMenuIds))
                    .map(child -> filterMenuTree(child, allowedMenuIds))
                    .toList();
        }

        return new MenuTreeDTO(
                menu.getId(),
                menu.getName(),
                menu.getCode(),
                menu.getIcon(),
                menu.getPath(),
                menu.getSortOrder(),
                menu.getIsActive(),
                children
        );
    }

    @Transactional
    public MenuDTO createMenu(CreateMenuRequest request) {
        if (menuRepository.existsByCode(request.code())) {
            throw new DuplicateResourceException("Menu", "code", request.code());
        }

        Menu menu = MenuMapper.toEntity(request);
        
        if (request.parentId() != null) {
            Menu parent = menuRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu", "id", request.parentId()));
            menu.setParent(parent);
        }

        menu = menuRepository.save(menu);
        return MenuMapper.toDTO(menu);
    }

    @Transactional
    public MenuDTO updateMenu(Long id, UpdateMenuRequest request) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", "id", id));

        if (request.name() != null) {
            menu.setName(request.name());
        }
        if (request.icon() != null) {
            menu.setIcon(request.icon());
        }
        if (request.path() != null) {
            menu.setPath(request.path());
        }
        if (request.sortOrder() != null) {
            menu.setSortOrder(request.sortOrder());
        }
        if (request.isActive() != null) {
            menu.setIsActive(request.isActive());
        }
        if (request.parentId() != null) {
            Menu parent = menuRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu", "id", request.parentId()));
            menu.setParent(parent);
        } else {
            menu.setParent(null);
        }

        menu = menuRepository.save(menu);
        return MenuMapper.toDTO(menu);
    }

    @Transactional
    public void deleteMenu(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", "id", id));
        menuRepository.delete(menu);
    }
}
