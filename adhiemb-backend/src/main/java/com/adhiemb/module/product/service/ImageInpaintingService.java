package com.adhiemb.module.product.service;

import com.adhiemb.exception.BadRequestException;
import com.adhiemb.module.product.dto.ApplyMaskRequest;
import com.adhiemb.module.product.dto.MaskedImageResponse;
import com.adhiemb.storage.FstoreStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayDeque;
import java.util.Base64;
import java.util.PriorityQueue;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImageInpaintingService {

    private final FstoreStorageService storageService;

    private static final int KNOWN = 0;
    private static final int BAND = 1;
    private static final int INSIDE = 2;

    public MaskedImageResponse applyMaskAndInpaint(ApplyMaskRequest request) {
        if (!StringUtils.hasText(request.getMaskImageBase64())) {
            throw new BadRequestException("Mask image data is required.");
        }

        try {
            // 1. Decode original image
            BufferedImage originalImage = loadOriginalImage(request);
            if (originalImage == null) {
                throw new BadRequestException("Failed to load original image.");
            }

            int width = originalImage.getWidth();
            int height = originalImage.getHeight();

            // 2. Decode mask image
            BufferedImage maskImage = decodeBase64Image(request.getMaskImageBase64());
            if (maskImage == null) {
                throw new BadRequestException("Invalid mask image format.");
            }

            // Ensure mask has identical dimensions
            if (maskImage.getWidth() != width || maskImage.getHeight() != height) {
                BufferedImage resizedMask = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
                Graphics2D g2d = resizedMask.createGraphics();
                g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g2d.drawImage(maskImage, 0, 0, width, height, null);
                g2d.dispose();
                maskImage = resizedMask;
            }

            // 3. Execute Inpainting Algorithm
            int radius = request.getInpaintRadius() != null && request.getInpaintRadius() > 0 ? request.getInpaintRadius() : 4;
            BufferedImage cleanedImage = executeTeleaInpainting(originalImage, maskImage, radius);

            // 4. Save cleaned image
            ByteArrayOutputStream cleanedOs = new ByteArrayOutputStream();
            ImageIO.write(cleanedImage, "png", cleanedOs);
            byte[] cleanedBytes = cleanedOs.toByteArray();

            String fileName = StringUtils.hasText(request.getFileName()) ? request.getFileName() : "design_cleaned.png";
            String cleanedUrl = storageService.storeBytes(cleanedBytes, "products", fileName, "image/png");

            // Save original image if base64 provided
            String originalUrl = request.getOriginalImageUrl();
            if (!StringUtils.hasText(originalUrl) && StringUtils.hasText(request.getOriginalImageBase64())) {
                ByteArrayOutputStream origOs = new ByteArrayOutputStream();
                ImageIO.write(originalImage, "png", origOs);
                originalUrl = storageService.storeBytes(origOs.toByteArray(), "products", "orig_" + fileName, "image/png");
            }

            return MaskedImageResponse.builder()
                    .originalImageUrl(originalUrl)
                    .maskedImageUrl(cleanedUrl)
                    .width(width)
                    .height(height)
                    .fileSizeBytes((long) cleanedBytes.length)
                    .message("Mask applied and image cleaned successfully.")
                    .build();

        } catch (Exception e) {
            log.error("Image inpainting failed", e);
            throw new BadRequestException("Image inpainting processing failed: " + e.getMessage());
        }
    }

    private BufferedImage loadOriginalImage(ApplyMaskRequest request) throws IOException {
        if (StringUtils.hasText(request.getOriginalImageBase64())) {
            return decodeBase64Image(request.getOriginalImageBase64());
        }

        if (StringUtils.hasText(request.getOriginalImageUrl())) {
            String urlStr = request.getOriginalImageUrl();
            if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) {
                return ImageIO.read(new URL(urlStr));
            } else if (urlStr.startsWith("/api/public/files/")) {
                String relativePath = urlStr.replace("/api/public/files/", "");
                return ImageIO.read(storageService.loadResource(relativePath).getInputStream());
            }
        }

        return null;
    }

    private BufferedImage decodeBase64Image(String base64Data) throws IOException {
        String cleanBase64 = base64Data;
        if (cleanBase64.contains(",")) {
            cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(",") + 1);
        }
        byte[] bytes = Base64.getDecoder().decode(cleanBase64.trim());
        try (InputStream is = new ByteArrayInputStream(bytes)) {
            return ImageIO.read(is);
        }
    }

    /**
     * Fast Marching Telea Inpainting Algorithm Implementation
     */
    private BufferedImage executeTeleaInpainting(BufferedImage srcImg, BufferedImage maskImg, int radius) {
        int width = srcImg.getWidth();
        int height = srcImg.getHeight();

        BufferedImage result = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        int[] pixels = srcImg.getRGB(0, 0, width, height, null, 0, width);
        int[] maskPixels = maskImg.getRGB(0, 0, width, height, null, 0, width);

        byte[] flag = new byte[width * height];
        float[] dist = new float[width * height];

        boolean hasMask = false;

        for (int i = 0; i < width * height; i++) {
            int alpha = (maskPixels[i] >> 24) & 0xFF;
            int red = (maskPixels[i] >> 16) & 0xFF;

            if (alpha > 30 || red > 100) {
                flag[i] = (byte) INSIDE;
                dist[i] = 1e6f;
                hasMask = true;
            } else {
                flag[i] = (byte) KNOWN;
                dist[i] = 0f;
            }
        }

        if (!hasMask) {
            result.setRGB(0, 0, width, height, pixels, 0, width);
            return result;
        }

        // Priority Queue for fast marching
        ArrayDeque<Integer> band = new ArrayDeque<>();

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int idx = y * width + x;
                if (flag[idx] == INSIDE) {
                    boolean isBoundary = false;
                    for (int dy = -1; dy <= 1; dy++) {
                        for (int dx = -1; dx <= 1; dx++) {
                            if (dx == 0 && dy == 0) continue;
                            int nx = x + dx;
                            int ny = y + dy;
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                if (flag[ny * width + nx] == KNOWN) {
                                    isBoundary = true;
                                    break;
                                }
                            }
                        }
                        if (isBoundary) break;
                    }

                    if (isBoundary) {
                        flag[idx] = (byte) BAND;
                        dist[idx] = 1.0f;
                        band.add(idx);
                    }
                }
            }
        }

        while (!band.isEmpty()) {
            int currentIdx = band.poll();
            flag[currentIdx] = (byte) KNOWN;

            int cx = currentIdx % width;
            int cy = currentIdx / width;

            double rSum = 0, gSum = 0, bSum = 0, aSum = 0, weightSum = 0;

            for (int dy = -radius; dy <= radius; dy++) {
                for (int dx = -radius; dx <= radius; dx++) {
                    int dSq = dx * dx + dy * dy;
                    if (dSq > radius * radius) continue;

                    int nx = cx + dx;
                    int ny = cy + dy;

                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        int nidx = ny * width + nx;
                        if (flag[nidx] == KNOWN && dist[nidx] < dist[currentIdx]) {
                            double distance = Math.sqrt(dSq);
                            double w = 1.0 / (1.0 + distance * distance);

                            int color = pixels[nidx];
                            int a = (color >> 24) & 0xFF;
                            int r = (color >> 16) & 0xFF;
                            int g = (color >> 8) & 0xFF;
                            int b = color & 0xFF;

                            rSum += r * w;
                            gSum += g * w;
                            bSum += b * w;
                            aSum += a * w;
                            weightSum += w;
                        }
                    }
                }
            }

            if (weightSum > 0) {
                int a = Math.min(255, (int) Math.round(aSum / weightSum));
                int r = Math.min(255, (int) Math.round(rSum / weightSum));
                int g = Math.min(255, (int) Math.round(gSum / weightSum));
                int b = Math.min(255, (int) Math.round(bSum / weightSum));
                pixels[currentIdx] = (a << 24) | (r << 16) | (g << 8) | b;
            }

            for (int dy = -1; dy <= 1; dy++) {
                for (int dx = -1; dx <= 1; dx++) {
                    if (dx == 0 && dy == 0) continue;
                    int nx = cx + dx;
                    int ny = cy + dy;

                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        int nidx = ny * width + nx;
                        if (flag[nidx] == INSIDE) {
                            flag[nidx] = (byte) BAND;
                            dist[nidx] = dist[currentIdx] + 1.0f;
                            band.add(nidx);
                        }
                    }
                }
            }
        }

        result.setRGB(0, 0, width, height, pixels, 0, width);
        return result;
    }
}
