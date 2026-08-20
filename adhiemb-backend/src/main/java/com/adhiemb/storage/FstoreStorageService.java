package com.adhiemb.storage;

import com.adhiemb.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class FstoreStorageService {

    private final FstoreEnvironmentResolver environmentResolver;
    private final Path fstoreRootLocation;

    private static final Set<String> ALLOWED_IMAGE_MIME_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    public FstoreStorageService(FstoreEnvironmentResolver environmentResolver) {
        this.environmentResolver = environmentResolver;
        this.fstoreRootLocation = environmentResolver.getResolvedFstorePath();
        try {
            Files.createDirectories(fstoreRootLocation);
            Files.createDirectories(fstoreRootLocation.resolve("categories"));
            Files.createDirectories(fstoreRootLocation.resolve("products"));
            Files.createDirectories(fstoreRootLocation.resolve("users"));
            Files.createDirectories(fstoreRootLocation.resolve("banners"));
            Files.createDirectories(fstoreRootLocation.resolve("promotions"));
            log.info("Initialized fstore root directory at: {} (Env: {})", fstoreRootLocation, environmentResolver.getActiveEnvironmentName());
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize fstore storage location", e);
        }
    }

    public String storeFileUpload(MultipartFile file, String module) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            double sizeMb = (double) file.getSize() / (1024 * 1024);
            throw new BadRequestException(String.format("Image size is %.1f MB. Maximum allowed image size is 5 MB.", sizeMb));
        }

        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_IMAGE_MIME_TYPES.contains(mimeType.toLowerCase())) {
            throw new BadRequestException("Unsupported image format. Please select JPG, JPEG, PNG, or WEBP.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.png");
        String extension = getFileExtension(originalFilename, mimeType);

        String moduleDir = normalizeModule(module);
        String uniqueFileName = generateUniqueFileName(moduleDir, extension);

        try {
            Path targetDir = fstoreRootLocation.resolve(moduleDir).normalize();
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(uniqueFileName).normalize();

            validatePathSafety(targetPath);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = "fstore/" + moduleDir + "/" + uniqueFileName;
            log.info("Successfully stored uploaded file: {}", relativePath);
            return getPublicUrl(relativePath);
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new RuntimeException("Failed to store uploaded file.", e);
        }
    }

    public String processImageFromUrlOrUpload(String imageUrl, String module) {
        if (!StringUtils.hasText(imageUrl)) {
            return imageUrl;
        }

        // If already stored in fstore or local serving URL, return as-is
        if (imageUrl.contains("/fstore/") || imageUrl.contains("fstore/")) {
            return imageUrl;
        }

        // Validate HTTP/HTTPS protocol
        if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
            return imageUrl;
        }

        // Security check against SSRF
        validateUrlSafety(imageUrl);

        try {
            log.info("Downloading external image from URL for fstore ingestion: {}", imageUrl);
            URL url = new URL(imageUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(10000);
            conn.setRequestProperty("User-Agent", "AdhiEMB-FstoreImageIngest/1.0");

            int responseCode = conn.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                log.warn("Failed to download external image from URL: {} (HTTP Status: {})", imageUrl, responseCode);
                return imageUrl;
            }

            String contentType = conn.getContentType();
            if (contentType != null && contentType.contains(";")) {
                contentType = contentType.split(";")[0].trim();
            }

            byte[] imageBytes = conn.getInputStream().readAllBytes();
            if (imageBytes.length == 0 || imageBytes.length > MAX_FILE_SIZE_BYTES) {
                log.warn("Downloaded image bytes invalid or exceeds limit for URL: {}", imageUrl);
                return imageUrl;
            }

            String extension = getFileExtensionFromMime(contentType);
            String moduleDir = normalizeModule(module);
            String uniqueFileName = generateUniqueFileName(moduleDir, extension);

            Path targetDir = fstoreRootLocation.resolve(moduleDir).normalize();
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(uniqueFileName).normalize();

            validatePathSafety(targetPath);

            Files.copy(new ByteArrayInputStream(imageBytes), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = "fstore/" + moduleDir + "/" + uniqueFileName;
            log.info("Successfully ingested external image to fstore: {}", relativePath);
            return getPublicUrl(relativePath);
        } catch (Exception e) {
            log.error("Failed to download and ingest external image URL: {}", imageUrl, e);
            // Fallback to original URL if download fails
            return imageUrl;
        }
    }

    public Resource loadResource(String relativePath) {
        try {
            Path file = fstoreRootLocation.getParent().resolve(relativePath).normalize();
            if (!file.startsWith(fstoreRootLocation.getParent())) {
                throw new BadRequestException("Access denied: Path traversal detected.");
            }

            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + relativePath);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + relativePath, e);
        }
    }

    public void deleteFile(String relativePath) {
        if (!StringUtils.hasText(relativePath) || !relativePath.contains("fstore/")) {
            return;
        }
        try {
            Path file = fstoreRootLocation.getParent().resolve(relativePath).normalize();
            if (file.startsWith(fstoreRootLocation)) {
                Files.deleteIfExists(file);
                log.info("Deleted fstore file: {}", relativePath);
            }
        } catch (IOException e) {
            log.warn("Could not delete fstore file: {}", relativePath, e);
        }
    }

    public String generateUniqueFileName(String module, String extension) {
        String prefix = switch (module.toLowerCase()) {
            case "categories" -> "cat";
            case "products" -> "prod";
            case "users" -> "usr";
            case "banners" -> "bnr";
            case "promotions" -> "prm";
            default -> "img";
        };

        String uniqueId = Long.toHexString(System.currentTimeMillis());
        String randomId = UUID.randomUUID().toString().substring(0, 8);
        String ext = extension.startsWith(".") ? extension : "." + extension;

        return String.format("%s_%s_%s%s", prefix, uniqueId, randomId, ext);
    }

    private void validatePathSafety(Path targetPath) {
        if (!targetPath.startsWith(fstoreRootLocation)) {
            throw new BadRequestException("Security Violation: Path traversal attack detected.");
        }
    }

    private void validateUrlSafety(String urlStr) {
        String lower = urlStr.toLowerCase();
        if (lower.contains("localhost") || lower.contains("127.0.0.1") || lower.contains("169.254.") || lower.contains("10.") || lower.contains("192.168.")) {
            throw new BadRequestException("Security Violation: SSRF attempt blocked.");
        }
    }

    private String getFileExtension(String filename, String mimeType) {
        int idx = filename.lastIndexOf('.');
        if (idx > 0) {
            return filename.substring(idx);
        }
        return getFileExtensionFromMime(mimeType);
    }

    private String getFileExtensionFromMime(String mimeType) {
        if (mimeType == null) return ".png";
        return switch (mimeType.toLowerCase()) {
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "image/svg+xml" -> ".svg";
            default -> ".png";
        };
    }

    private String normalizeModule(String module) {
        if (!StringUtils.hasText(module)) return "products";
        String cleaned = module.toLowerCase().trim();
        if (Set.of("categories", "products", "users", "banners", "promotions").contains(cleaned)) {
            return cleaned;
        }
        return "products";
    }

    public String getPublicUrl(String relativePath) {
        return "/api/public/files/" + relativePath;
    }

    public Path getFstoreRootLocation() {
        return fstoreRootLocation;
    }
}
