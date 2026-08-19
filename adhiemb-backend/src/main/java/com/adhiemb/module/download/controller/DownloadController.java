package com.adhiemb.module.download.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.common.PagedResponse;
import com.adhiemb.module.download.dto.DownloadTokenDTO;
import com.adhiemb.module.download.dto.UserDownloadDTO;
import com.adhiemb.module.download.service.DownloadService;
import com.adhiemb.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/downloads")
@RequiredArgsConstructor
public class DownloadController {

    private final DownloadService downloadService;

    @GetMapping("/my-downloads")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PagedResponse<UserDownloadDTO>> getMyDownloads(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            Pageable pageable) {
        PagedResponse<UserDownloadDTO> downloads = downloadService.getUserDownloads(userDetails.getId(), pageable);
        return ApiResponse.success("User downloads retrieved successfully", downloads);
    }

    @GetMapping("/token/{token}")
    public ApiResponse<DownloadTokenDTO> getTokenDetails(@PathVariable String token) {
        DownloadTokenDTO tokenDTO = downloadService.getTokenByToken(token);
        return ApiResponse.success("Download token details retrieved", tokenDTO);
    }

    @GetMapping("/file/{token}")
    public ResponseEntity<Resource> downloadFileByToken(@PathVariable String token) {
        DownloadService.FileDownloadResponse response = downloadService.downloadFileByToken(token);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + response.fileName() + "\"")
                .body(response.resource());
    }
}
