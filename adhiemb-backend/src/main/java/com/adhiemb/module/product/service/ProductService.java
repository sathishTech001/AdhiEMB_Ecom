package com.adhiemb.module.product.service;

import com.adhiemb.common.PagedResponse;
import com.adhiemb.exception.BadRequestException;
import com.adhiemb.exception.ForbiddenException;
import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.category.entity.Category;
import com.adhiemb.module.category.repository.CategoryRepository;
import com.adhiemb.module.product.dto.*;
import com.adhiemb.module.product.entity.Product;
import com.adhiemb.module.product.entity.ProductFile;
import com.adhiemb.module.product.entity.ProductImage;
import com.adhiemb.module.product.enums.MachineFormat;
import com.adhiemb.module.product.enums.ProductStatus;
import com.adhiemb.module.product.mapper.ProductMapper;
import com.adhiemb.module.product.repository.ProductFileRepository;
import com.adhiemb.module.product.repository.ProductImageRepository;
import com.adhiemb.module.product.repository.ProductRepository;
import com.adhiemb.module.user.entity.User;
import com.adhiemb.module.user.repository.UserRepository;
import com.adhiemb.security.SecurityUtils;
import com.adhiemb.storage.FstoreStorageService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductFileRepository productFileRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final com.adhiemb.module.notification.service.NotificationService notificationService;
    private final FstoreStorageService fstoreStorageService;

    public PagedResponse<ProductDTO> getAllProducts(Pageable pageable, ProductStatus status) {
        Page<Product> page;
        if (status != null) {
            page = productRepository.findByStatus(status, pageable);
        } else {
            page = productRepository.findAll(pageable);
        }
        return PagedResponse.of(page.map(ProductMapper::toDTO));
    }

    public PagedResponse<ProductDTO> getProductsForDesigner(Long designerId, Pageable pageable, ProductStatus status) {
        Page<Product> page;
        if (status != null) {
            page = productRepository.findByDesignerIdAndStatus(designerId, status, pageable);
        } else {
            page = productRepository.findByDesignerId(designerId, pageable);
        }
        return PagedResponse.of(page.map(ProductMapper::toDTO));
    }

    @Transactional
    public ProductDetailDTO getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        
        if (product.getStatus() != ProductStatus.APPROVED) {
            throw new ResourceNotFoundException("Product not found with slug: " + slug);
        }

        // Increment view count
        product.setViewCount((product.getViewCount() == null ? 0 : product.getViewCount()) + 1);
        productRepository.save(product);

        return ProductMapper.toDetailDTO(product);
    }

    public ProductDetailDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return ProductMapper.toDetailDTO(product);
    }

    @Transactional
    @com.adhiemb.module.auditlog.annotation.Auditable(action = "PRODUCT_CREATE", module = "PRODUCT", entityType = "Product")
    public ProductDetailDTO createProduct(CreateProductRequest request, Long designerId) {
        if (request.price() != null && request.price().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Product price cannot be negative");
        }
        if (request.discountPrice() != null) {
            if (request.discountPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Discount price cannot be negative");
            }
            if (request.price() != null && request.discountPrice().compareTo(request.price()) > 0) {
                throw new BadRequestException("Discount price cannot be greater than regular price");
            }
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));

        User designer = userRepository.findById(designerId)
                .orElseThrow(() -> new ResourceNotFoundException("Designer user not found with id: " + designerId));

        String baseSlug = generateSlug(request.title());
        String slug = baseSlug;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        Product product = Product.builder()
                .title(request.title())
                .slug(slug)
                .description(request.description())
                .price(request.price())
                .discountPrice(request.discountPrice())
                .stitchCount(request.stitchCount() != null ? request.stitchCount() : 0)
                .widthMm(request.widthMm())
                .heightMm(request.heightMm())
                .colorCount(request.colorCount() != null ? request.colorCount() : 1)
                .stopCount(request.stopCount() != null ? request.stopCount() : 1)
                .category(category)
                .designer(designer)
                .status(ProductStatus.DRAFT)
                .isFeatured(false)
                .downloadsCount(0)
                .viewCount(0)
                .ratingAverage(BigDecimal.ZERO)
                .ratingCount(0)
                .build();

        Product savedProduct = productRepository.save(product);

        if (request.imageUrls() != null && !request.imageUrls().isEmpty()) {
            int order = 1;
            for (String rawUrl : request.imageUrls()) {
                String storedUrl = fstoreStorageService.processImageFromUrlOrUpload(rawUrl, "products");
                ProductImage image = ProductImage.builder()
                        .product(savedProduct)
                        .imageUrl(storedUrl)
                        .isPrimary(order == 1)
                        .sortOrder(order++)
                        .build();
                savedProduct.getImages().add(image);
            }
            savedProduct = productRepository.save(savedProduct);
        }

        return ProductMapper.toDetailDTO(savedProduct);
    }

    @Transactional
    @com.adhiemb.module.auditlog.annotation.Auditable(action = "PRODUCT_UPDATE", module = "PRODUCT", entityType = "Product")
    public ProductDetailDTO updateProduct(Long id, UpdateProductRequest request, Long currentUserId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        verifyOwnerOrAdmin(product, currentUserId);

        if (request.price() != null && request.price().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Product price cannot be negative");
        }
        if (request.discountPrice() != null) {
            if (request.discountPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Discount price cannot be negative");
            }
            BigDecimal effectivePrice = request.price() != null ? request.price() : product.getPrice();
            if (effectivePrice != null && request.discountPrice().compareTo(effectivePrice) > 0) {
                throw new BadRequestException("Discount price cannot be greater than regular price");
            }
        }

        if (StringUtils.hasText(request.title()) && !product.getTitle().equals(request.title())) {
            product.setTitle(request.title());
            String baseSlug = generateSlug(request.title());
            String slug = baseSlug;
            int counter = 1;
            while (productRepository.existsBySlug(slug) && !slug.equals(product.getSlug())) {
                slug = baseSlug + "-" + counter++;
            }
            product.setSlug(slug);
        }

        if (StringUtils.hasText(request.description())) {
            product.setDescription(request.description());
        }

        if (request.price() != null) {
            product.setPrice(request.price());
        }

        if (request.discountPrice() != null) {
            product.setDiscountPrice(request.discountPrice());
        }

        if (request.stitchCount() != null) {
            product.setStitchCount(request.stitchCount());
        }

        if (request.widthMm() != null) {
            product.setWidthMm(request.widthMm());
        }

        if (request.heightMm() != null) {
            product.setHeightMm(request.heightMm());
        }

        if (request.colorCount() != null) {
            product.setColorCount(request.colorCount());
        }

        if (request.stopCount() != null) {
            product.setStopCount(request.stopCount());
        }

        if (request.categoryId() != null && !request.categoryId().equals(product.getCategory().getId())) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));
            product.setCategory(category);
        }

        if (request.imageUrls() != null) {
            product.getImages().clear();
            int order = 1;
            for (String rawUrl : request.imageUrls()) {
                String storedUrl = fstoreStorageService.processImageFromUrlOrUpload(rawUrl, "products");
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .imageUrl(storedUrl)
                        .isPrimary(order == 1)
                        .sortOrder(order++)
                        .build();
                product.getImages().add(image);
            }
        }

        Product updatedProduct = productRepository.save(product);
        return ProductMapper.toDetailDTO(updatedProduct);
    }

    @Transactional
    @com.adhiemb.module.auditlog.annotation.Auditable(action = "PRODUCT_SUBMIT", module = "PRODUCT", entityType = "Product")
    public ProductDetailDTO submitForApproval(Long id, Long currentUserId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        verifyOwnerOrAdmin(product, currentUserId);

        if (product.getStatus() != ProductStatus.DRAFT && product.getStatus() != ProductStatus.REJECTED) {
            throw new BadRequestException("Product status must be DRAFT or REJECTED to submit for approval");
        }

        product.setStatus(ProductStatus.PENDING_APPROVAL);
        product.setRejectionReason(null);
        Product savedProduct = productRepository.save(product);
        return ProductMapper.toDetailDTO(savedProduct);
    }

    @Transactional
    @com.adhiemb.module.auditlog.annotation.Auditable(action = "PRODUCT_APPROVAL", module = "PRODUCT", entityType = "Product")
    public ProductDetailDTO approveOrRejectProduct(Long id, ProductApprovalRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (request.status() != ProductStatus.APPROVED && request.status() != ProductStatus.REJECTED) {
            throw new BadRequestException("Status must be APPROVED or REJECTED");
        }

        product.setStatus(request.status());
        if (request.status() == ProductStatus.REJECTED) {
            product.setRejectionReason(request.rejectionReason());
        } else {
            product.setRejectionReason(null);
        }

        Product savedProduct = productRepository.save(product);

        if (savedProduct.getDesigner() != null) {
            if (savedProduct.getStatus() == ProductStatus.APPROVED) {
                notificationService.sendNotification(
                        savedProduct.getDesigner().getId(),
                        "Product Approved",
                        "Your product '" + savedProduct.getTitle() + "' has been approved and published to the marketplace.",
                        "PRODUCT_APPROVED",
                        "/products/" + savedProduct.getSlug()
                );
            } else if (savedProduct.getStatus() == ProductStatus.REJECTED) {
                notificationService.sendNotification(
                        savedProduct.getDesigner().getId(),
                        "Product Rejected",
                        "Your product '" + savedProduct.getTitle() + "' was rejected. Reason: " + (savedProduct.getRejectionReason() != null ? savedProduct.getRejectionReason() : "None provided"),
                        "PRODUCT_REJECTED",
                        "/designer/products"
                );
            }
        }

        return ProductMapper.toDetailDTO(savedProduct);
    }

    @Transactional
    public void deleteProduct(Long id, Long currentUserId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        verifyOwnerOrAdmin(product, currentUserId);

        if (product.getImages() != null) {
            for (ProductImage img : product.getImages()) {
                if (StringUtils.hasText(img.getImageUrl())) {
                    fstoreStorageService.deleteFile(img.getImageUrl());
                }
            }
        }

        productRepository.delete(product);
    }

    @Transactional
    public ProductFileDTO attachFileToProduct(Long productId, String filePath, MachineFormat format, Long fileSize, String originalName) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        ProductFile productFile = ProductFile.builder()
                .product(product)
                .filePath(filePath)
                .fileFormat(format)
                .fileSizeBytes(fileSize != null ? fileSize : 0L)
                .originalFileName(originalName)
                .build();

        ProductFile savedFile = productFileRepository.save(productFile);
        return ProductMapper.toFileDTO(savedFile);
    }

    @Transactional
    public ProductImageDTO attachImageToProduct(Long productId, String imageUrl, boolean isPrimary) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (isPrimary) {
            product.getImages().forEach(img -> img.setIsPrimary(false));
            productImageRepository.saveAll(product.getImages());
        }

        int nextSortOrder = product.getImages().size() + 1;
        String storedUrl = fstoreStorageService.processImageFromUrlOrUpload(imageUrl, "products");

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(storedUrl)
                .isPrimary(isPrimary || product.getImages().isEmpty())
                .sortOrder(nextSortOrder)
                .build();

        ProductImage savedImage = productImageRepository.save(image);
        return ProductMapper.toImageDTO(savedImage);
    }

    public PagedResponse<ProductDTO> searchPublicProducts(ProductFilterRequest filter, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("status"), ProductStatus.APPROVED));

            if (filter != null) {
                if (StringUtils.hasText(filter.search())) {
                    String pattern = "%" + filter.search().toLowerCase() + "%";
                    Predicate titlePredicate = cb.like(cb.lower(root.get("title")), pattern);
                    Predicate descPredicate = cb.like(cb.lower(root.get("description")), pattern);
                    predicates.add(cb.or(titlePredicate, descPredicate));
                }

                if (filter.categoryId() != null) {
                    predicates.add(cb.equal(root.get("category").get("id"), filter.categoryId()));
                }

                if (StringUtils.hasText(filter.categorySlug())) {
                    predicates.add(cb.equal(root.get("category").get("slug"), filter.categorySlug()));
                }

                if (filter.format() != null) {
                    Join<Product, ProductFile> fileJoin = root.join("files", JoinType.INNER);
                    predicates.add(cb.equal(fileJoin.get("fileFormat"), filter.format()));
                    query.distinct(true);
                }

                if (filter.minPrice() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.minPrice()));
                }

                if (filter.maxPrice() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.maxPrice()));
                }

                if (filter.minStitch() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("stitchCount"), filter.minStitch()));
                }

                if (filter.maxStitch() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("stitchCount"), filter.maxStitch()));
                }

                if (Boolean.TRUE.equals(filter.featured())) {
                    predicates.add(cb.equal(root.get("isFeatured"), true));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> page = productRepository.findAll(spec, pageable);
        return PagedResponse.of(page.map(ProductMapper::toDTO));
    }

    public PagedResponse<ProductDTO> getFeaturedProducts(Pageable pageable) {
        Page<Product> page = productRepository.findByIsFeaturedTrueAndStatus(ProductStatus.APPROVED, pageable);
        return PagedResponse.of(page.map(ProductMapper::toDTO));
    }

    public PagedResponse<ProductDTO> getProductsByCategorySlug(String categorySlug, Pageable pageable) {
        Page<Product> page = productRepository.findByCategorySlugAndStatus(categorySlug, ProductStatus.APPROVED, pageable);
        return PagedResponse.of(page.map(ProductMapper::toDTO));
    }

    private void verifyOwnerOrAdmin(Product product, Long currentUserId) {
        if (currentUserId == null) return;
        boolean isDesigner = product.getDesigner().getId().equals(currentUserId);
        boolean isAdmin = SecurityUtils.hasPermission("PRODUCT_APPROVE") || SecurityUtils.hasPermission("PRODUCT_DELETE");
        if (!isDesigner && !isAdmin) {
            throw new ForbiddenException("You do not have permission to modify this product");
        }
    }

    private String generateSlug(String input) {
        if (input == null) return "";
        return input.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
