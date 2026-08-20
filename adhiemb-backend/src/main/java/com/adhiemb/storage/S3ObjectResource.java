package com.adhiemb.storage;

import org.springframework.core.io.ByteArrayResource;

public class S3ObjectResource extends ByteArrayResource {
    private final String filename;
    private final String contentType;

    public S3ObjectResource(byte[] byteArray, String filename, String contentType) {
        super(byteArray);
        this.filename = filename;
        this.contentType = contentType;
    }

    @Override
    public String getFilename() {
        return this.filename;
    }

    public String getContentType() {
        return this.contentType;
    }
}
