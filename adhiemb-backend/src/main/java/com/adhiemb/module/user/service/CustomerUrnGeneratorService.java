package com.adhiemb.module.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class CustomerUrnGeneratorService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Atomically generates a thread-safe Customer URN using a sequence counter table.
     * Format: CUST-YYYY-XXXXXX (e.g. CUST-2026-000001)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generateNextUrn() {
        jdbcTemplate.update("UPDATE customer_urn_sequence SET current_value = current_value + 1 WHERE id = 1");
        Long seq = jdbcTemplate.queryForObject("SELECT current_value FROM customer_urn_sequence WHERE id = 1", Long.class);
        if (seq == null || seq == 0L) {
            seq = 1L;
        }
        int currentYear = Year.now().getValue();
        return String.format("CUST-%d-%06d", currentYear, seq);
    }
}
