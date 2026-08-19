package com.adhiemb.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, String directory);
    Resource load(String filePath);
    void delete(String filePath);
    String getUrl(String filePath);
}
