package com.adhiemb.module.product.repository;

import com.adhiemb.module.product.entity.Product;
import com.adhiemb.module.product.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByCategoryId(Long categoryId);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    Page<Product> findByDesignerId(Long designerId, Pageable pageable);

    Page<Product> findByDesignerIdAndStatus(Long designerId, ProductStatus status, Pageable pageable);

    Page<Product> findByCategorySlugAndStatus(String categorySlug, ProductStatus status, Pageable pageable);

    Page<Product> findByIsFeaturedTrueAndStatus(ProductStatus status, Pageable pageable);

    @Query("SELECT SUM(p.downloadsCount) FROM Product p")
    Long sumTotalDownloads();

    @Query("SELECT COUNT(DISTINCT p.designer.id) FROM Product p")
    Long countDistinctDesigners();
}

