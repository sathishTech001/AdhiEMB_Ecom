package com.adhiemb.storage;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/files")
@RequiredArgsConstructor
@Slf4j
public class PublicFileController {

    private final StorageService storageService;

    private static final java.util.Set<String> PROTECTED_MACHINE_EXTENSIONS = java.util.Set.of(
            ".dst", ".pes", ".exp", ".jef", ".emb", ".vp3", ".hus", ".xxx", ".zip", ".rar"
    );

    @GetMapping("/**")
    public ResponseEntity<Resource> getFile(HttpServletRequest request) {
        String fullPath = request.getRequestURI();
        String path = fullPath.substring(fullPath.indexOf("/api/public/files/") + "/api/public/files/".length());

        String lowerPath = path.toLowerCase();
        for (String ext : PROTECTED_MACHINE_EXTENSIONS) {
            if (lowerPath.endsWith(ext)) {
                log.warn("Security Alert: Direct unauthenticated public access attempt to machine embroidery file blocked: {}", path);
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
        }

        Resource resource = storageService.load(path);

        String contentType = null;
        if (resource instanceof S3ObjectResource s3Resource && s3Resource.getContentType() != null) {
            contentType = s3Resource.getContentType();
        }

        if (contentType == null) {
            try {
                if (resource.getFilename() != null) {
                    contentType = request.getServletContext().getMimeType(resource.getFilename());
                }
                if (contentType == null && resource.isFile()) {
                    contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
                }
            } catch (Exception ex) {
                log.debug("Could not resolve MIME type from servlet context for file: {}", path);
            }
        }

        if (contentType == null) {
            String fn = resource.getFilename() != null ? resource.getFilename().toLowerCase() : "";
            if (fn.endsWith(".jpg") || fn.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (fn.endsWith(".png")) contentType = "image/png";
            else if (fn.endsWith(".webp")) contentType = "image/webp";
            else if (fn.endsWith(".svg")) contentType = "image/svg+xml";
            else if (fn.endsWith(".gif")) contentType = "image/gif";
            else contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
