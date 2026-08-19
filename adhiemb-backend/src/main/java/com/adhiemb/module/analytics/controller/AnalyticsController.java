package com.adhiemb.module.analytics.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.analytics.dto.AnalyticsSummaryDTO;
import com.adhiemb.module.analytics.dto.DesignerPayoutDTO;
import com.adhiemb.module.analytics.dto.RevenueChartPointDTO;
import com.adhiemb.module.analytics.dto.TopProductSalesDTO;
import com.adhiemb.module.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<AnalyticsSummaryDTO> getSummaryStats() {
        AnalyticsSummaryDTO summary = analyticsService.getSummaryStats();
        return ApiResponse.success("Analytics summary retrieved successfully", summary);
    }

    @GetMapping("/revenue-chart")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<RevenueChartPointDTO>> getRevenueChart(
            @RequestParam(defaultValue = "30") int days) {
        List<RevenueChartPointDTO> chartData = analyticsService.getRevenueChart(days);
        return ApiResponse.success("Revenue chart data retrieved successfully", chartData);
    }

    @GetMapping("/top-products")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<TopProductSalesDTO>> getTopProducts(
            @RequestParam(defaultValue = "5") int limit) {
        List<TopProductSalesDTO> topProducts = analyticsService.getTopProducts(limit);
        return ApiResponse.success("Top selling products retrieved successfully", topProducts);
    }

    @GetMapping("/designer-payouts")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<DesignerPayoutDTO>> getDesignerPayouts() {
        List<DesignerPayoutDTO> payouts = analyticsService.getDesignerPayouts();
        return ApiResponse.success("Designer payout summaries retrieved successfully", payouts);
    }
}
