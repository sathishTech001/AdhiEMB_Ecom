package com.adhiemb.module.role.entity;

import com.adhiemb.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "role_permissions",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    @Builder.Default
    private List<Permission> permissions = new ArrayList<>();

    // Wait, I need Menu entity first to map menus here... I will leave the mapping string type for now, or just not map menus strictly.
    // The instructions say "role_menus join table", so I should probably create a join table mapping to menu_id
    // But since I don't have Menu entity yet, I'll use Long for now or just skip mapping until Menu is created, wait, I can create Menu entity later and it will resolve.
    // Better to just map Menu entity right away assuming it will exist in com.adhiemb.module.menu.entity.Menu
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "role_menus",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "menu_id")
    )
    @Builder.Default
    private List<com.adhiemb.module.menu.entity.Menu> menus = new ArrayList<>();
}
