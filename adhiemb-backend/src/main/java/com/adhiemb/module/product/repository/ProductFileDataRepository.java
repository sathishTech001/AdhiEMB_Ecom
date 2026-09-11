package com.adhiemb.module.product.repository;

import com.adhiemb.module.product.entity.ProductFileData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductFileDataRepository extends JpaRepository<ProductFileData, Long> {
    List<ProductFileData> findByProductId(Long productId);
    List<ProductFileData> findByProductIdAndIsActiveTrue(Long productId);
}
