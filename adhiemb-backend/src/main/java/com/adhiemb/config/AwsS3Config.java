package com.adhiemb.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@Slf4j
public class AwsS3Config {

    @Value("${app.aws.region:ap-south-1}")
    private String awsRegion;

    @Bean
    @Lazy
    public S3Client s3Client() {
        log.info("Initializing AWS S3 Client with Region: [{}], using AWS DefaultCredentialsProvider chain (IAM Instance Profile / Environment)", awsRegion);
        return S3Client.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}
