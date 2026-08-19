package com.adhiemb.module.product.repository;

import com.adhiemb.module.product.entity.ProductFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductFileRepository extends JpaRepository<ProductFile, Long> {

    List<ProductFile> findByProductId(Long productId);
}
