package com.adhiemb.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@Primary
public class LocalStorageService implements StorageService {

    private final Path rootLocation;
    private final FstoreStorageService fstoreStorageService;

    public LocalStorageService(
            @Value("${app.storage.fstore-path:./fstore}") String fstorePath,
            FstoreStorageService fstoreStorageService) {
        this.rootLocation = Paths.get(fstorePath).toAbsolutePath().normalize();
        this.fstoreStorageService = fstoreStorageService;
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize fstore storage location", e);
        }
    }

    @Override
    public String store(MultipartFile file, String directory) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file.");
        }
        String module = (directory != null && !directory.isEmpty()) ? directory : "products";
        String publicUrl = fstoreStorageService.storeFileUpload(file, module);
        
        // Return relative path for response compatibility
        return publicUrl.replace("/api/public/files/", "");
    }

    @Override
    public Resource load(String filePath) {
        try {
            Path file = rootLocation.getParent().resolve(filePath).normalize();
            if (!file.startsWith(rootLocation.getParent())) {
                throw new RuntimeException("Access denied: Path traversal detected.");
            }
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                // Fallback attempt resolving directly inside fstore root
                Path directFile = rootLocation.resolve(filePath).normalize();
                Resource directResource = new UrlResource(directFile.toUri());
                if (directResource.exists() || directResource.isReadable()) {
                    return directResource;
                }
                throw new RuntimeException("Could not read file: " + filePath);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + filePath, e);
        }
    }

    @Override
    public void delete(String filePath) {
        fstoreStorageService.deleteFile(filePath);
    }

    @Override
    public String getUrl(String filePath) {
        if (filePath == null) return null;
        if (filePath.startsWith("/api/public/files/")) return filePath;
        return "/api/public/files/" + filePath;
    }
}
