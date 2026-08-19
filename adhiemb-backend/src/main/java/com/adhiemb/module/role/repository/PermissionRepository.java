package com.adhiemb.module.role.repository;

import com.adhiemb.module.role.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    List<Permission> findByModule(String module);
    Optional<Permission> findByModuleAndAction(String module, String action);
}
