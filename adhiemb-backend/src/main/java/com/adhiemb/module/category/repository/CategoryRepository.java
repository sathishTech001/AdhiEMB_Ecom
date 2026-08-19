package com.adhiemb.module.category.repository;

import com.adhiemb.module.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByParentIsNullOrderBySortOrderAsc();

    List<Category> findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc();

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByParentId(Long parentId);

    List<Category> findByIsActiveTrueOrderBySortOrderAsc();

    List<Category> findAllByOrderBySortOrderAsc();
}
