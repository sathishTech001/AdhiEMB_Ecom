package com.adhiemb.module.menu.repository;

import com.adhiemb.module.menu.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    List<Menu> findByParentIsNullOrderBySortOrder();
    List<Menu> findByCodeIn(List<String> codes);
    List<Menu> findByIsActiveTrue();
    Optional<Menu> findByCode(String code);
    boolean existsByCode(String code);
}
