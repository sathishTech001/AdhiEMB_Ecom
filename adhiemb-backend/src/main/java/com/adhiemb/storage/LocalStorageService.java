package com.adhiemb.storage;

import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Primary
public class LocalStorageService implements StorageService {

    private final FstoreStorageService fstoreStorageService;

    public LocalStorageService(FstoreStorageService fstoreStorageService) {
        this.fstoreStorageService = fstoreStorageService;
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
        return fstoreStorageService.loadResource(filePath);
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
