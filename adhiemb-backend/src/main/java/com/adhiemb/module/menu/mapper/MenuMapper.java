package com.adhiemb.module.menu.mapper;

import com.adhiemb.module.menu.dto.CreateMenuRequest;
import com.adhiemb.module.menu.dto.MenuDTO;
import com.adhiemb.module.menu.dto.MenuTreeDTO;
import com.adhiemb.module.menu.entity.Menu;

import java.util.List;
import java.util.stream.Collectors;

public class MenuMapper {

    public static MenuDTO toDTO(Menu menu) {
        if (menu == null) {
            return null;
        }

        return new MenuDTO(
                menu.getId(),
                menu.getName(),
                menu.getCode(),
                menu.getIcon(),
                menu.getPath(),
                menu.getParent() != null ? menu.getParent().getId() : null,
                menu.getSortOrder(),
                menu.getIsActive()
        );
    }

    public static MenuTreeDTO toTreeDTO(Menu menu) {
        if (menu == null) {
            return null;
        }

        List<MenuTreeDTO> children = null;
        if (menu.getChildren() != null && !menu.getChildren().isEmpty()) {
            children = menu.getChildren().stream()
                    .map(MenuMapper::toTreeDTO)
                    .collect(Collectors.toList());
        } else {
            children = List.of();
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

    public static Menu toEntity(CreateMenuRequest request) {
        if (request == null) {
            return null;
        }

        return Menu.builder()
                .name(request.name())
                .code(request.code())
                .icon(request.icon())
                .path(request.path())
                .sortOrder(request.sortOrder() != null ? request.sortOrder() : 0)
                .isActive(true)
                .build();
    }
}
