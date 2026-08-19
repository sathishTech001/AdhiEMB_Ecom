package com.adhiemb.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@Slf4j
public class FstoreEnvironmentResolver {

    private final String configuredPath;
    private final Environment environment;
    private final String activeEnvironmentName;
    private final Path resolvedFstorePath;

    public FstoreEnvironmentResolver(
            @Value("${app.storage.fstore-path:}") String configuredPath,
            Environment environment) {
        this.configuredPath = configuredPath;
        this.environment = environment;
        this.activeEnvironmentName = predictEnvironment();
        this.resolvedFstorePath = resolveFstorePath();

        log.info("==========================================================");
        log.info("FSTORE ENVIRONMENT AUTO-PREDICTOR");
        log.info("  -> Active Environment : {}", activeEnvironmentName);
        log.info("  -> OS Name             : {}", System.getProperty("os.name"));
        log.info("  -> Is Docker Container : {}", isDockerContainer());
        log.info("  -> Configured Path     : {}", StringUtils.hasText(configuredPath) ? configuredPath : "(Auto-detected)");
        log.info("  -> Resolved Fstore Path: {}", resolvedFstorePath.toAbsolutePath().normalize());
        log.info("==========================================================");
    }

    public String predictEnvironment() {
        String envOverride = System.getenv("APP_ENV");
        if (StringUtils.hasText(envOverride)) {
            return envOverride.toUpperCase();
        }

        String[] activeProfiles = environment.getActiveProfiles();
        if (activeProfiles != null && activeProfiles.length > 0) {
            for (String profile : activeProfiles) {
                String p = profile.toLowerCase();
                if (p.contains("prod")) return "PRODUCTION";
                if (p.contains("sandbox") || p.contains("staging")) return "SANDBOX";
                if (p.contains("dev")) return "DEV";
                if (p.contains("local")) return "LOCAL";
            }
        }

        return "LOCAL";
    }

    public Path resolveFstorePath() {
        // Priority 1: Environment variable explicit override
        String envPath = System.getenv("FSTORE_PATH");
        if (StringUtils.hasText(envPath)) {
            return Paths.get(envPath).toAbsolutePath().normalize();
        }

        // Priority 2: Configured path in application-{env}.yml
        if (StringUtils.hasText(configuredPath) && !configuredPath.equals("./fstore")) {
            return Paths.get(configuredPath).toAbsolutePath().normalize();
        }

        boolean isDocker = isDockerContainer();
        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");

        // Priority 3: Environment prediction
        return switch (activeEnvironmentName) {
            case "PRODUCTION" -> isDocker || !isWindows ? Paths.get("/var/app/fstore-prod") : Paths.get("./fstore-prod");
            case "SANDBOX" -> isDocker || !isWindows ? Paths.get("/var/app/fstore-sandbox") : Paths.get("./fstore-sandbox");
            case "DEV" -> Paths.get("./fstore-dev");
            default -> Paths.get("./fstore-local"); // LOCAL
        };
    }

    public boolean isDockerContainer() {
        return new File("/.dockerenv").exists() 
                || "true".equalsIgnoreCase(System.getenv("IS_DOCKER"))
                || "docker".equalsIgnoreCase(System.getenv("CONTAINER"));
    }

    public String getActiveEnvironmentName() {
        return activeEnvironmentName;
    }

    public Path getResolvedFstorePath() {
        return resolvedFstorePath;
    }
}
