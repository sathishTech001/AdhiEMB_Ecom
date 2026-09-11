package com.adhiemb.storage;

import com.adhiemb.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.services.s3.S3Client;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class FstoreStorageServiceTest {

    private FstoreStorageService fstoreStorageService;
    private FstoreEnvironmentResolver environmentResolver;
    private ObjectProvider<S3Client> s3ClientProvider;

    @TempDir
    Path tempDir;

    // Standard valid headers (Magic Bytes)
    private static final byte[] VALID_JPG_BYTES = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 'J', 'F', 'I', 'F', 0, 1, 1, 0, 0, 1};
    private static final byte[] VALID_PNG_BYTES = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 'I', 'H', 'D', 'R'};
    private static final byte[] VALID_WEBP_BYTES = new byte[]{'R', 'I', 'F', 'F', 0x20, 0x00, 0x00, 0x00, 'W', 'E', 'B', 'P', 'V', 'P', '8', ' '};

    @BeforeEach
    void setUp() {
        environmentResolver = mock(FstoreEnvironmentResolver.class);
        when(environmentResolver.getResolvedFstorePath()).thenReturn(tempDir.resolve("fstore"));
        when(environmentResolver.getActiveEnvironmentName()).thenReturn("LOCAL");

        s3ClientProvider = mock(ObjectProvider.class);

        fstoreStorageService = new FstoreStorageService(environmentResolver, s3ClientProvider);
    }

    @Test
    @DisplayName("Case A: Valid JPG upload should succeed")
    void testCaseA_JpgUpload_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "product.jpg", "image/jpeg", VALID_JPG_BYTES
        );

        String resultUrl = fstoreStorageService.storeFileUpload(file, "products");

        assertNotNull(resultUrl);
        assertTrue(resultUrl.startsWith("/api/public/files/fstore/products/prod_"));
        assertTrue(resultUrl.endsWith(".jpg"));
    }

    @Test
    @DisplayName("Case B: Valid JPEG upload should succeed")
    void testCaseB_JpegUpload_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "banner.jpeg", "image/jpeg", VALID_JPG_BYTES
        );

        String resultUrl = fstoreStorageService.storeFileUpload(file, "banners");

        assertNotNull(resultUrl);
        assertTrue(resultUrl.startsWith("/api/public/files/fstore/banners/bnr_"));
        assertTrue(resultUrl.endsWith(".jpeg") || resultUrl.endsWith(".jpg"));
    }

    @Test
    @DisplayName("Case C: Valid PNG upload should succeed")
    void testCaseC_PngUpload_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "category.png", "image/png", VALID_PNG_BYTES
        );

        String resultUrl = fstoreStorageService.storeFileUpload(file, "categories");

        assertNotNull(resultUrl);
        assertTrue(resultUrl.startsWith("/api/public/files/fstore/categories/cat_"));
        assertTrue(resultUrl.endsWith(".png"));
    }

    @Test
    @DisplayName("Case D: Valid WEBP upload should succeed")
    void testCaseD_WebpUpload_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "user_avatar.webp", "image/webp", VALID_WEBP_BYTES
        );

        String resultUrl = fstoreStorageService.storeFileUpload(file, "users");

        assertNotNull(resultUrl);
        assertTrue(resultUrl.startsWith("/api/public/files/fstore/users/usr_"));
        assertTrue(resultUrl.endsWith(".webp"));
    }

    @Test
    @DisplayName("Case E: Unsupported extension and binary file type should throw BadRequestException")
    void testCaseE_UnsupportedFileType_ThrowsBadRequestException() {
        byte[] pdfBytes = "%PDF-1.4 dummy pdf content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file", "document.pdf", "application/pdf", pdfBytes
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                fstoreStorageService.storeFileUpload(file, "products")
        );

        assertEquals("Unsupported image format. Please select JPG, JPEG, PNG, or WEBP.", ex.getMessage());
    }

    @Test
    @DisplayName("Case F: Image larger than 5 MB should throw BadRequestException with size error message")
    void testCaseF_ImageLargerThan5MB_ThrowsBadRequestException() {
        byte[] oversizedBytes = new byte[6 * 1024 * 1024]; // 6 MB
        System.arraycopy(VALID_JPG_BYTES, 0, oversizedBytes, 0, VALID_JPG_BYTES.length);

        MockMultipartFile file = new MockMultipartFile(
                "file", "large_image.jpg", "image/jpeg", oversizedBytes
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                fstoreStorageService.storeFileUpload(file, "products")
        );

        assertEquals("Image size is 6.0 MB. Maximum allowed image size is 5 MB.", ex.getMessage());
    }

    @Test
    @DisplayName("Case G: Valid image with missing or unexpected client MIME type (e.g. application/octet-stream from Postman) should succeed via magic bytes")
    void testCaseG_MissingOrUnexpectedClientMimeType_Success() {
        MockMultipartFile fileWithOctetStream = new MockMultipartFile(
                "file", "photo_from_postman.jpg", "application/octet-stream", VALID_JPG_BYTES
        );

        String resultUrl1 = fstoreStorageService.storeFileUpload(fileWithOctetStream, "products");
        assertNotNull(resultUrl1);
        assertTrue(resultUrl1.startsWith("/api/public/files/fstore/products/prod_"));

        MockMultipartFile fileWithNullMime = new MockMultipartFile(
                "file", "photo_no_mime.jpg", null, VALID_JPG_BYTES
        );

        String resultUrl2 = fstoreStorageService.storeFileUpload(fileWithNullMime, "categories");
        assertNotNull(resultUrl2);
        assertTrue(resultUrl2.startsWith("/api/public/files/fstore/categories/cat_"));
    }
}
