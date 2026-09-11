package com.adhiemb.module.download.service;

import com.adhiemb.common.PagedResponse;
import com.adhiemb.exception.BadRequestException;
import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.download.dto.DownloadTokenDTO;
import com.adhiemb.module.download.dto.UserDownloadDTO;
import com.adhiemb.module.download.entity.DownloadToken;
import com.adhiemb.module.download.repository.DownloadTokenRepository;
import com.adhiemb.module.order.entity.Order;
import com.adhiemb.module.order.entity.OrderItem;
import com.adhiemb.module.order.repository.OrderRepository;
import com.adhiemb.module.product.entity.Product;
import com.adhiemb.module.product.entity.ProductFileData;
import com.adhiemb.module.product.entity.ProductImage;
import com.adhiemb.module.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.adhiemb.storage.FstoreStorageService;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DownloadService {

    private final DownloadTokenRepository downloadTokenRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final FstoreStorageService fstoreStorageService;

    @Transactional
    public List<DownloadToken> generateTokensForOrder(Order order) {
        List<DownloadToken> tokens = new ArrayList<>();
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return tokens;
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product == null) continue;

            if (item.getProductFile() != null) {
                ProductFileData file = item.getProductFile();
                Optional<DownloadToken> existingToken = downloadTokenRepository
                        .findByUserIdAndOrderIdAndProductIdAndFileId(
                                order.getUser().getId(), order.getId(), product.getId(), file.getId());

                if (existingToken.isPresent()) {
                    tokens.add(existingToken.get());
                } else {
                    DownloadToken newToken = DownloadToken.builder()
                            .token("tok_" + UUID.randomUUID().toString().replace("-", ""))
                            .user(order.getUser())
                            .order(order)
                            .product(product)
                            .file(file)
                            .downloadCount(0)
                            .maxDownloads(null)  // null = unlimited lifetime downloads
                            .expiresAt(null)     // null = no expiry, lifetime access
                            .build();
                    tokens.add(downloadTokenRepository.save(newToken));
                }
            } else {
                List<ProductFileData> files = product.getFiles();
                if (files != null && !files.isEmpty()) {
                    for (ProductFileData file : files) {
                        Optional<DownloadToken> existingToken = downloadTokenRepository
                                .findByUserIdAndOrderIdAndProductIdAndFileId(
                                        order.getUser().getId(), order.getId(), product.getId(), file.getId());

                        if (existingToken.isPresent()) {
                            tokens.add(existingToken.get());
                        } else {
                            DownloadToken newToken = DownloadToken.builder()
                                    .token("tok_" + UUID.randomUUID().toString().replace("-", ""))
                                    .user(order.getUser())
                                    .order(order)
                                    .product(product)
                                    .file(file)
                                    .downloadCount(0)
                                    .maxDownloads(null)  // null = unlimited lifetime downloads
                                    .expiresAt(null)     // null = no expiry, lifetime access
                                    .build();
                            tokens.add(downloadTokenRepository.save(newToken));
                        }
                    }
                } else {
                    DownloadToken newToken = DownloadToken.builder()
                            .token("tok_" + UUID.randomUUID().toString().replace("-", ""))
                            .user(order.getUser())
                            .order(order)
                            .product(product)
                            .file(null)
                            .downloadCount(0)
                            .maxDownloads(null)  // null = unlimited lifetime downloads
                            .expiresAt(null)     // null = no expiry, lifetime access
                            .build();
                    tokens.add(downloadTokenRepository.save(newToken));
                }
            }
        }
        return tokens;
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserDownloadDTO> getUserDownloads(Long userId, Pageable pageable) {
        Page<DownloadToken> tokenPage = downloadTokenRepository.findByUserId(userId, pageable);

        // Group tokens by order and product
        Map<String, List<DownloadToken>> grouped = tokenPage.getContent().stream()
                .collect(Collectors.groupingBy(
                        t -> t.getOrder().getId() + "_" + t.getProduct().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<UserDownloadDTO> userDownloads = new ArrayList<>();
        for (List<DownloadToken> groupTokens : grouped.values()) {
            if (groupTokens.isEmpty()) continue;
            DownloadToken firstToken = groupTokens.get(0);
            Product product = firstToken.getProduct();

            String primaryImageUrl = null;
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                primaryImageUrl = product.getImages().stream()
                        .filter(ProductImage::getIsPrimary)
                        .map(ProductImage::getImageUrl)
                        .findFirst()
                        .orElse(product.getImages().get(0).getImageUrl());
            }

            List<DownloadTokenDTO> tokenDTOs = groupTokens.stream()
                    .map(this::mapToTokenDTO)
                    .collect(Collectors.toList());

            userDownloads.add(new UserDownloadDTO(
                    product.getId(),
                    product.getTitle(),
                    product.getSlug(),
                    primaryImageUrl,
                    firstToken.getOrder().getOrderNumber(),
                    firstToken.getOrder().getCreatedAt(),
                    tokenDTOs
            ));
        }

        return new PagedResponse<>(
                userDownloads,
                tokenPage.getNumber(),
                tokenPage.getSize(),
                tokenPage.getTotalElements(),
                tokenPage.getTotalPages(),
                tokenPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public DownloadTokenDTO getTokenByToken(String tokenStr) {
        DownloadToken token = downloadTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new ResourceNotFoundException("DownloadToken", "token", tokenStr));

        validateTokenOwnership(token);

        return mapToTokenDTO(token);
    }

    @Transactional
    public FileDownloadResponse downloadFileByToken(String tokenStr) {
        DownloadToken token = downloadTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new ResourceNotFoundException("DownloadToken", "token", tokenStr));

        validateTokenOwnership(token);

        if (token.getOrder() != null && token.getOrder().getPaymentStatus() != com.adhiemb.module.payment.enums.PaymentStatus.SUCCESS) {
            throw new com.adhiemb.exception.ForbiddenException("Download access requires a completed paid order");
        }

        // Lifetime tokens have null expiresAt — only check if explicitly set
        if (token.getExpiresAt() != null && token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Download token has expired");
        }

        // Lifetime tokens have null maxDownloads — null means unlimited, never block
        if (token.getMaxDownloads() != null && token.getDownloadCount() >= token.getMaxDownloads()) {
            throw new BadRequestException("Download limit reached for this file (" + token.getMaxDownloads() + " downloads max)");
        }

        token.setDownloadCount(token.getDownloadCount() + 1);
        downloadTokenRepository.save(token);

        Product product = token.getProduct();
        if (product != null) {
            product.setDownloadsCount(product.getDownloadsCount() + 1);
            productRepository.save(product);
        }

        String fileName;
        Resource resource;

        if (token.getFile() != null) {
            ProductFileData pf = token.getFile();
            fileName = pf.getOriginalFileName() != null ? pf.getOriginalFileName() : (product.getSlug() + "." + pf.getFileFormat().name().toLowerCase());
            String path = pf.getStorageKey();
            Resource loadedResource = null;
            if (org.springframework.util.StringUtils.hasText(path)) {
                try {
                    loadedResource = fstoreStorageService.loadResource(path);
                } catch (Exception e) {
                    log.warn("Could not load physical machine file from storage key: '{}'. Falling back to content descriptor. Error: {}", path, e.getMessage());
                }
            }

            if (loadedResource != null && loadedResource.exists() && loadedResource.isReadable()) {
                resource = loadedResource;
            } else {
                String dummyContent = "ADHIEMB DIGITAL EMBROIDERY DESIGN FILE\n" +
                        "Product: " + product.getTitle() + "\n" +
                        "File: " + (pf.getOriginalFileName() != null ? pf.getOriginalFileName() : fileName) + "\n" +
                        "Machine Info: " + (pf.getMachineInfo() != null ? pf.getMachineInfo() : "Standard") + "\n" +
                        "Format: " + pf.getFileFormat() + "\n" +
                        "Token: " + tokenStr + "\n";
                resource = new ByteArrayResource(dummyContent.getBytes(StandardCharsets.UTF_8));
            }
        } else {
            fileName = product.getSlug() + "_embroidery_design.dst";
            String dummyContent = "ADHIEMB DIGITAL EMBROIDERY DESIGN FILE\n" +
                    "Product: " + product.getTitle() + "\n" +
                    "Token: " + tokenStr + "\n";
            resource = new ByteArrayResource(dummyContent.getBytes(StandardCharsets.UTF_8));
        }

        return new FileDownloadResponse(fileName, resource);
    }

    private void validateTokenOwnership(DownloadToken token) {
        Long currentUserId = com.adhiemb.security.SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new com.adhiemb.exception.UnauthorizedException("Authentication is required to access download files");
        }

        if (!token.getUser().getId().equals(currentUserId)) {
            boolean isAdminOrOwner = com.adhiemb.security.SecurityUtils.hasPermission("ROLE_ADMIN")
                    || com.adhiemb.security.SecurityUtils.hasPermission("ROLE_OWNER")
                    || com.adhiemb.security.SecurityUtils.hasPermission("ORDER_VIEW");
            if (!isAdminOrOwner) {
                throw new com.adhiemb.exception.ForbiddenException("You do not have permission to access this download token");
            }
        }
    }

    public DownloadTokenDTO mapToTokenDTO(DownloadToken token) {
        ProductFileData file = token.getFile();
        String fileName = file != null && file.getOriginalFileName() != null
                ? file.getOriginalFileName()
                : (token.getProduct().getTitle() + (file != null ? "." + file.getFileFormat().name().toLowerCase() : ".dst"));

        String fileFormat = file != null ? file.getFileFormat().name() : "DST";
        String machineInfo = file != null ? file.getMachineInfo() : null;

        return new DownloadTokenDTO(
                token.getId(),
                token.getToken(),
                token.getUser().getId(),
                token.getOrder().getId(),
                token.getOrder().getOrderNumber(),
                token.getProduct().getId(),
                token.getProduct().getTitle(),
                file != null ? file.getId() : null,
                fileName,
                fileFormat,
                machineInfo,
                token.getDownloadCount(),
                token.getMaxDownloads(),
                token.getExpiresAt()
        );
    }

    public record FileDownloadResponse(String fileName, Resource resource) {}
}
