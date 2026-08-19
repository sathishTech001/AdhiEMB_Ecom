package com.adhiemb.module.download.repository;

import com.adhiemb.module.download.entity.DownloadToken;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DownloadTokenRepository extends JpaRepository<DownloadToken, Long> {

    Optional<DownloadToken> findByToken(String token);

    List<DownloadToken> findByUserId(Long userId);

    Page<DownloadToken> findByUserId(Long userId, Pageable pageable);

    List<DownloadToken> findByOrderId(Long orderId);

    Optional<DownloadToken> findByUserIdAndOrderIdAndProductIdAndFileId(Long userId, Long orderId, Long productId, Long fileId);
}
