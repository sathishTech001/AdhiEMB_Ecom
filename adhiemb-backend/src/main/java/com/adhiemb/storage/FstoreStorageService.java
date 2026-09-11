package com.adhiemb.storage;

import com.adhiemb.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
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
    private final ObjectProvider<S3Client> s3ClientProvider;

    @Value("${app.storage.type:local}")
    private String storageType;

    @Value("${app.aws.s3.bucket:adhiemb-ecom-fstore}")
    private String s3BucketName;

    private static final Set<String> ALLOWED_IMAGE_MIME_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private static final Set<String> ALLOWED_MACHINE_EXTENSIONS = Set.of(
            "dst", "pes", "exp", "jef", "emb", "vp3", "hus", "xxx", "zip", "rar"
    );

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

    public FstoreStorageService(
            FstoreEnvironmentResolver environmentResolver,
            ObjectProvider<S3Client> s3ClientProvider) {
        this.environmentResolver = environmentResolver;
        this.s3ClientProvider = s3ClientProvider;
        this.fstoreRootLocation = environmentResolver.getResolvedFstorePath().toAbsolutePath().normalize();

        try {
            Files.createDirectories(fstoreRootLocation);
            Files.createDirectories(fstoreRootLocation.resolve("categories"));
            Files.createDirectories(fstoreRootLocation.resolve("products"));
            Files.createDirectories(fstoreRootLocation.resolve("users"));
            Files.createDirectories(fstoreRootLocation.resolve("banners"));
            Files.createDirectories(fstoreRootLocation.resolve("promotions"));
            log.info("Initialized fstore root directory at: {} (Env: {})", fstoreRootLocation, environmentResolver.getActiveEnvironmentName());
        } catch (IOException e) {
            log.warn("Could not initialize local fstore directory (may use S3): {}", e.getMessage());
        }
    }

    public boolean isS3Storage() {
        return "s3".equalsIgnoreCase(storageType) || 
               ("PRODUCTION".equalsIgnoreCase(environmentResolver.getActiveEnvironmentName()) && "s3".equalsIgnoreCase(storageType));
    }

    public String storeFileUpload(MultipartFile file, String module) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            double sizeMb = (double) file.getSize() / (1024 * 1024);
            throw new BadRequestException(String.format("Image size is %.1f MB. Maximum allowed image size is 5 MB.", sizeMb));
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file.png");
        String extension = getFileExtension(originalFilename, null);
        String extLower = extension.startsWith(".") ? extension.substring(1).toLowerCase() : extension.toLowerCase();

        String mimeType;
        if (ALLOWED_MACHINE_EXTENSIONS.contains(extLower)) {
            mimeType = "application/octet-stream";
        } else {
            mimeType = detectImageMimeType(file, originalFilename);
            if (mimeType == null || !ALLOWED_IMAGE_MIME_TYPES.contains(mimeType.toLowerCase())) {
                throw new BadRequestException("Unsupported image format. Please select JPG, JPEG, PNG, or WEBP.");
            }
        }

        String moduleDir = normalizeModule(module);
        String uniqueFileName = generateUniqueFileName(moduleDir, extension);

        if (isS3Storage()) {
            return storeToS3(file, moduleDir, uniqueFileName, mimeType);
        } else {
            return storeToLocalStorage(file, moduleDir, uniqueFileName);
        }
    }

    private String storeToS3(MultipartFile file, String moduleDir, String uniqueFileName, String mimeType) {
        String s3Key = moduleDir + "/" + uniqueFileName;
        try {
            S3Client s3Client = s3ClientProvider.getObject();
            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(s3BucketName)
                    .key(s3Key)
                    .contentType(mimeType)
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putReq, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String relativePath = "fstore/" + moduleDir + "/" + uniqueFileName;
            log.info("Successfully uploaded file to AWS S3: bucket={}, key={}", s3BucketName, s3Key);
            return getPublicUrl(relativePath);
        } catch (S3Exception e) {
            log.error("AWS S3 PutObject failed for key: {} in bucket: {}", s3Key, s3BucketName, e);
            throw new RuntimeException("AWS S3 upload failed: " + e.awsErrorDetails().errorMessage(), e);
        } catch (IOException e) {
            log.error("Failed to read file input stream for S3 upload: {}", s3Key, e);
            throw new RuntimeException("Failed to read upload file stream", e);
        }
    }

    private String storeToLocalStorage(MultipartFile file, String moduleDir, String uniqueFileName) {
        try {
            Path targetDir = fstoreRootLocation.resolve(moduleDir).normalize();
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(uniqueFileName).normalize();

            validatePathSafety(targetPath);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = "fstore/" + moduleDir + "/" + uniqueFileName;
            log.info("Successfully stored uploaded file to local fstore: {}", relativePath);
            return getPublicUrl(relativePath);
        } catch (IOException e) {
            log.error("Failed to store local file", e);
            throw new RuntimeException("Failed to store uploaded file.", e);
        }
    }

    public String storeBytes(byte[] bytes, String module, String originalFilename, String mimeType) {
        if (bytes == null || bytes.length == 0) {
            throw new BadRequestException("Failed to store empty bytes.");
        }

        if (bytes.length > MAX_FILE_SIZE_BYTES) {
            double sizeMb = (double) bytes.length / (1024 * 1024);
            throw new BadRequestException(String.format("Image size is %.1f MB. Maximum allowed image size is 5 MB.", sizeMb));
        }

        String safeName = StringUtils.cleanPath(originalFilename != null ? originalFilename : "cleaned_image.png");
        String safeMime = (mimeType != null && ALLOWED_IMAGE_MIME_TYPES.contains(mimeType.toLowerCase())) ? mimeType.toLowerCase() : "image/png";
        String extension = getFileExtensionFromMime(safeMime);
        String moduleDir = normalizeModule(module);
        String uniqueFileName = generateUniqueFileName(moduleDir, extension);

        if (isS3Storage()) {
            String s3Key = moduleDir + "/" + uniqueFileName;
            try {
                S3Client s3Client = s3ClientProvider.getObject();
                PutObjectRequest putReq = PutObjectRequest.builder()
                        .bucket(s3BucketName)
                        .key(s3Key)
                        .contentType(safeMime)
                        .contentLength((long) bytes.length)
                        .build();

                s3Client.putObject(putReq, RequestBody.fromBytes(bytes));

                String relativePath = "fstore/" + moduleDir + "/" + uniqueFileName;
                log.info("Successfully uploaded bytes to AWS S3: bucket={}, key={}", s3BucketName, s3Key);
                return getPublicUrl(relativePath);
            } catch (Exception e) {
                log.error("AWS S3 PutObject failed for key: {}", s3Key, e);
                throw new RuntimeException("AWS S3 byte upload failed: " + e.getMessage(), e);
            }
        } else {
            try {
                Path targetDir = fstoreRootLocation.resolve(moduleDir).normalize();
                Files.createDirectories(targetDir);
                Path targetPath = targetDir.resolve(uniqueFileName).normalize();

                validatePathSafety(targetPath);

                Files.copy(new ByteArrayInputStream(bytes), targetPath, StandardCopyOption.REPLACE_EXISTING);

                String relativePath = "fstore/" + moduleDir + "/" + uniqueFileName;
                log.info("Successfully stored bytes to local fstore: {}", relativePath);
                return getPublicUrl(relativePath);
            } catch (IOException e) {
                log.error("Failed to store local bytes", e);
                throw new RuntimeException("Failed to store uploaded bytes.", e);
            }
        }
    }

    public String processImageFromUrlOrUpload(String imageUrl, String module) {
        if (!StringUtils.hasText(imageUrl)) {
            return imageUrl;
        }

        // If already stored in fstore or serving URL, return as-is
        if (imageUrl.contains("/fstore/") || imageUrl.contains("fstore/")) {
            return imageUrl;
        }

        // Handle base64 data URLs directly
        if (imageUrl.startsWith("data:")) {
            try {
                int commaIdx = imageUrl.indexOf(",");
                if (commaIdx != -1) {
                    String header = imageUrl.substring(0, commaIdx);
                    String data = imageUrl.substring(commaIdx + 1);
                    String mimeType = "image/png";
                    if (header.contains(":") && header.contains(";")) {
                        mimeType = header.substring(header.indexOf(":") + 1, header.indexOf(";"));
                    }
                    byte[] imageBytes = java.util.Base64.getDecoder().decode(data.trim());
                    return storeBytes(imageBytes, module, "product_image.png", mimeType);
                }
            } catch (Exception e) {
                log.error("Failed to decode and store base64 image data URL", e);
            }
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

            String mimeType = detectImageMimeTypeFromBytes(imageBytes, contentType);
            if (mimeType == null || !ALLOWED_IMAGE_MIME_TYPES.contains(mimeType.toLowerCase())) {
                log.warn("External image from URL {} has unsupported format: {}", imageUrl, mimeType);
                return imageUrl;
            }

            String extension = getFileExtensionFromMime(mimeType);
            String moduleDir = normalizeModule(module);
            String uniqueFileName = generateUniqueFileName(moduleDir, extension);

            if (isS3Storage()) {
                String s3Key = moduleDir + "/" + uniqueFileName;
                S3Client s3Client = s3ClientProvider.getObject();
                PutObjectRequest putReq = PutObjectRequest.builder()
                        .bucket(s3BucketName)
                        .key(s3Key)
                        .contentType(mimeType)
                        .contentLength((long) imageBytes.length)
                        .build();

                s3Client.putObject(putReq, RequestBody.fromBytes(imageBytes));

                String relativePath = "fstore/" + moduleDir + "/" + uniqueFileName;
                log.info("Successfully ingested external image into AWS S3: bucket={}, key={}", s3BucketName, s3Key);
                return getPublicUrl(relativePath);
            } else {
                Path targetDir = fstoreRootLocation.resolve(moduleDir).normalize();
                Files.createDirectories(targetDir);
                Path targetPath = targetDir.resolve(uniqueFileName).normalize();

                validatePathSafety(targetPath);

                Files.copy(new ByteArrayInputStream(imageBytes), targetPath, StandardCopyOption.REPLACE_EXISTING);

                String relativePath = "fstore/" + moduleDir + "/" + uniqueFileName;
                log.info("Successfully ingested external image to local fstore: {}", relativePath);
                return getPublicUrl(relativePath);
            }
        } catch (Exception e) {
            log.error("Failed to download and ingest external image URL: {}", imageUrl, e);
            // Fallback to original URL if download fails
            return imageUrl;
        }
    }

    public Resource loadResource(String relativePath) {
        if (!StringUtils.hasText(relativePath)) {
            throw new BadRequestException("File path cannot be empty.");
        }

        if (isS3Storage()) {
            String s3Key = extractS3Key(relativePath);
            try {
                S3Client s3Client = s3ClientProvider.getObject();
                GetObjectRequest getReq = GetObjectRequest.builder()
                        .bucket(s3BucketName)
                        .key(s3Key)
                        .build();

                ResponseInputStream<GetObjectResponse> s3Stream = s3Client.getObject(getReq);
                byte[] bytes = s3Stream.readAllBytes();
                String contentType = s3Stream.response().contentType();
                String filename = s3Key.contains("/") ? s3Key.substring(s3Key.lastIndexOf('/') + 1) : s3Key;

                log.debug("Loaded file from AWS S3: bucket={}, key={}, size={}", s3BucketName, s3Key, bytes.length);
                return new S3ObjectResource(bytes, filename, contentType);
            } catch (NoSuchKeyException e) {
                log.warn("S3 Object not found for key: {} in bucket: {}", s3Key, s3BucketName);
                throw new RuntimeException("File not found in S3 storage: " + relativePath, e);
            } catch (S3Exception e) {
                log.error("AWS S3 GetObject error for key: {} in bucket: {}", s3Key, s3BucketName, e);
                throw new RuntimeException("Failed to load file from S3: " + e.awsErrorDetails().errorMessage(), e);
            } catch (IOException e) {
                log.error("Failed to read S3 stream for key: {}", s3Key, e);
                throw new RuntimeException("Failed to read file from S3 storage: " + relativePath, e);
            }
        } else {
            try {
                String cleanPath = relativePath.trim();
                if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);
                if (cleanPath.startsWith("api/public/files/")) cleanPath = cleanPath.substring("api/public/files/".length());
                if (cleanPath.startsWith("fstore/")) cleanPath = cleanPath.substring("fstore/".length());

                Path targetFile = fstoreRootLocation.resolve(cleanPath).toAbsolutePath().normalize();
                if (!targetFile.startsWith(fstoreRootLocation)) {
                    throw new BadRequestException("Access denied: Path traversal detected.");
                }

                Resource resource = new UrlResource(targetFile.toUri());
                if (resource.exists() && resource.isReadable()) {
                    return resource;
                } else {
                    Path parentFile = fstoreRootLocation.getParent().resolve(relativePath).toAbsolutePath().normalize();
                    Resource parentResource = new UrlResource(parentFile.toUri());
                    if (parentResource.exists() && parentResource.isReadable()) {
                        return parentResource;
                    }
                    throw new RuntimeException("Could not read file: " + relativePath);
                }
            } catch (MalformedURLException e) {
                throw new RuntimeException("Could not read file: " + relativePath, e);
            }
        }
    }

    public void deleteFile(String relativePath) {
        if (!StringUtils.hasText(relativePath)) {
            return;
        }

        if (isS3Storage()) {
            String s3Key = extractS3Key(relativePath);
            try {
                S3Client s3Client = s3ClientProvider.getObject();
                DeleteObjectRequest delReq = DeleteObjectRequest.builder()
                        .bucket(s3BucketName)
                        .key(s3Key)
                        .build();
                s3Client.deleteObject(delReq);
                log.info("Deleted file from AWS S3: bucket={}, key={}", s3BucketName, s3Key);
            } catch (S3Exception e) {
                log.warn("Could not delete file from S3: key={}, error={}", s3Key, e.awsErrorDetails().errorMessage());
            }
        } else {
            try {
                String cleanPath = relativePath.trim();
                if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);
                if (cleanPath.startsWith("api/public/files/")) cleanPath = cleanPath.substring("api/public/files/".length());
                if (cleanPath.startsWith("fstore/")) cleanPath = cleanPath.substring("fstore/".length());

                Path targetFile = fstoreRootLocation.resolve(cleanPath).toAbsolutePath().normalize();
                if (targetFile.startsWith(fstoreRootLocation)) {
                    Files.deleteIfExists(targetFile);
                    log.info("Deleted local fstore file: {}", relativePath);
                }
            } catch (IOException e) {
                log.warn("Could not delete local fstore file: {}", relativePath, e);
            }
        }
    }

    /**
     * Inspects magic bytes and metadata to reliably identify the image MIME type.
     * Prevents false 400 rejection when client content-type is missing or unexpected.
     */
    public String detectImageMimeType(MultipartFile file, String originalFilename) {
        // 1. Check Magic Bytes (Authoritative binary inspection)
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[16];
            int bytesRead = is.read(header);
            if (bytesRead >= 3 && isJpegHeader(header)) {
                return "image/jpeg";
            }
            if (bytesRead >= 8 && isPngHeader(header)) {
                return "image/png";
            }
            if (bytesRead >= 12 && isWebpHeader(header)) {
                return "image/webp";
            }
        } catch (IOException e) {
            log.warn("Could not read file header for magic byte detection: {}", e.getMessage());
        }

        // 2. Fallback: inspect client-provided MIME type if valid
        String clientMime = file.getContentType();
        if (clientMime != null) {
            String normalized = clientMime.toLowerCase().trim();
            if ("image/jpeg".equals(normalized) || "image/jpg".equals(normalized) || "image/pjpeg".equals(normalized)) {
                return "image/jpeg";
            }
            if ("image/png".equals(normalized) || "image/x-png".equals(normalized)) {
                return "image/png";
            }
            if ("image/webp".equals(normalized)) {
                return "image/webp";
            }
        }

        // 3. Fallback: inspect filename extension
        if (StringUtils.hasText(originalFilename)) {
            String lower = originalFilename.toLowerCase();
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                return "image/jpeg";
            }
            if (lower.endsWith(".png")) {
                return "image/png";
            }
            if (lower.endsWith(".webp")) {
                return "image/webp";
            }
        }

        return null;
    }

    public String detectImageMimeTypeFromBytes(byte[] bytes, String fallbackMime) {
        if (bytes != null && bytes.length >= 3) {
            if (isJpegHeader(bytes)) return "image/jpeg";
            if (bytes.length >= 8 && isPngHeader(bytes)) return "image/png";
            if (bytes.length >= 12 && isWebpHeader(bytes)) return "image/webp";
        }
        if (fallbackMime != null) {
            String norm = fallbackMime.toLowerCase().trim();
            if (ALLOWED_IMAGE_MIME_TYPES.contains(norm)) {
                return norm;
            }
        }
        return null;
    }

    private boolean isJpegHeader(byte[] header) {
        if (header == null || header.length < 3) return false;
        return (header[0] & 0xFF) == 0xFF &&
               (header[1] & 0xFF) == 0xD8 &&
               (header[2] & 0xFF) == 0xFF;
    }

    private boolean isPngHeader(byte[] header) {
        if (header == null || header.length < 8) return false;
        return (header[0] & 0xFF) == 0x89 &&
               (header[1] & 0xFF) == 0x50 && // P
               (header[2] & 0xFF) == 0x4E && // N
               (header[3] & 0xFF) == 0x47 && // G
               (header[4] & 0xFF) == 0x0D && // \r
               (header[5] & 0xFF) == 0x0A && // \n
               (header[6] & 0xFF) == 0x1A && // EOF
               (header[7] & 0xFF) == 0x0A;   // \n
    }

    private boolean isWebpHeader(byte[] header) {
        if (header == null || header.length < 12) return false;
        // RIFF header: bytes 0-3 must be 'R', 'I', 'F', 'F'
        boolean isRiff = header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F';
        // WEBP signature: bytes 8-11 must be 'W', 'E', 'B', 'P'
        boolean isWebp = header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P';
        return isRiff && isWebp;
    }

    private String extractS3Key(String relativePath) {
        String clean = relativePath.trim();
        if (clean.startsWith("/")) clean = clean.substring(1);
        if (clean.startsWith("api/public/files/")) clean = clean.substring("api/public/files/".length());
        if (clean.startsWith("fstore/")) clean = clean.substring("fstore/".length());
        return clean;
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
        if (!targetPath.toAbsolutePath().normalize().startsWith(fstoreRootLocation)) {
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

    public String getS3BucketName() {
        return s3BucketName;
    }
}
