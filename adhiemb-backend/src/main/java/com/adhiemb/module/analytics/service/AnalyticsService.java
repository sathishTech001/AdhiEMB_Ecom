package com.adhiemb.module.analytics.service;

import com.adhiemb.module.analytics.dto.AnalyticsSummaryDTO;
import com.adhiemb.module.analytics.dto.DesignerPayoutDTO;
import com.adhiemb.module.analytics.dto.RevenueChartPointDTO;
import com.adhiemb.module.analytics.dto.TopProductSalesDTO;
import com.adhiemb.module.order.entity.Order;
import com.adhiemb.module.order.enums.OrderStatus;
import com.adhiemb.module.order.repository.OrderItemRepository;
import com.adhiemb.module.order.repository.OrderRepository;
import com.adhiemb.module.product.entity.Product;
import com.adhiemb.module.product.repository.ProductRepository;
import com.adhiemb.module.setting.repository.SystemSettingRepository;
import com.adhiemb.module.user.entity.User;
import com.adhiemb.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SystemSettingRepository systemSettingRepository;

    @Transactional(readOnly = true)
    public AnalyticsSummaryDTO getSummaryStats() {
        BigDecimal totalRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.PAID);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        long totalOrders = orderRepository.countByStatus(OrderStatus.PAID);
        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();

        Long designerCount = productRepository.countDistinctDesigners();
        long totalDesigners = designerCount != null ? designerCount : 0L;

        Long downloadCount = productRepository.sumTotalDownloads();
        long totalDownloads = downloadCount != null ? downloadCount : 0L;

        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (totalOrders > 0) {
            averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);
        }

        return new AnalyticsSummaryDTO(
                totalRevenue,
                totalOrders,
                totalProducts,
                totalUsers,
                totalDesigners,
                totalDownloads,
                averageOrderValue
        );
    }

    @Transactional(readOnly = true)
    public List<RevenueChartPointDTO> getRevenueChart(int days) {
        if (days <= 0) days = 30;
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);
        LocalDateTime startDateTime = startDate.atStartOfDay();

        List<Order> paidOrders = orderRepository.findByStatusAndCreatedAtGreaterThanEqual(OrderStatus.PAID, startDateTime);

        Map<String, BigDecimal> revenueMap = new HashMap<>();
        Map<String, Long> countMap = new HashMap<>();

        for (Order order : paidOrders) {
            String dateStr = order.getCreatedAt().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
            revenueMap.put(dateStr, revenueMap.getOrDefault(dateStr, BigDecimal.ZERO).add(order.getTotalAmount()));
            countMap.put(dateStr, countMap.getOrDefault(dateStr, 0L) + 1);
        }

        List<RevenueChartPointDTO> chartPoints = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            String dateStr = current.format(DateTimeFormatter.ISO_LOCAL_DATE);
            BigDecimal dayRevenue = revenueMap.getOrDefault(dateStr, BigDecimal.ZERO);
            Long dayCount = countMap.getOrDefault(dateStr, 0L);
            chartPoints.add(new RevenueChartPointDTO(dateStr, dayRevenue, dayCount));
            current = current.plusDays(1);
        }

        return chartPoints;
    }

    @Transactional(readOnly = true)
    public List<TopProductSalesDTO> getTopProducts(int limit) {
        if (limit <= 0) limit = 5;
        List<Product> products = productRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "downloadsCount"))
        ).getContent();

        return products.stream().map(product -> {
            long salesCount = product.getDownloadsCount() != null ? product.getDownloadsCount() : 0L;
            BigDecimal minFilePrice = (product.getFiles() != null && !product.getFiles().isEmpty())
                    ? product.getFiles().stream().map(com.adhiemb.module.product.entity.ProductFileData::getPrice).filter(java.util.Objects::nonNull).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO)
                    : BigDecimal.ZERO;
            BigDecimal revenue = minFilePrice.multiply(BigDecimal.valueOf(salesCount));
            String categoryName = product.getCategory() != null ? product.getCategory().getName() : "Uncategorized";

            return new TopProductSalesDTO(
                    product.getId(),
                    product.getTitle(),
                    categoryName,
                    minFilePrice,
                    salesCount,
                    revenue,
                    product.getRatingAverage()
            );
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<DesignerPayoutDTO> getDesignerPayouts() {
        BigDecimal commissionRate = systemSettingRepository.findBySettingKey("designer_commission_rate")
                .map(s -> {
                    try {
                        return new BigDecimal(s.getSettingValue());
                    } catch (Exception e) {
                        return new BigDecimal("70");
                    }
                })
                .orElse(new BigDecimal("70"));

        List<User> users = userRepository.findAll();

        List<DesignerPayoutDTO> payouts = new ArrayList<>();

        for (User user : users) {
            boolean isDesigner = (user.getRole() != null && "DESIGNER".equalsIgnoreCase(user.getRole().getCode()))
                    || productRepository.findByDesignerId(user.getId(), PageRequest.of(0, 1)).getTotalElements() > 0;

            if (isDesigner) {
                List<Product> designerProducts = productRepository.findByDesignerId(user.getId(), PageRequest.of(0, 100)).getContent();

                long totalSales = 0;
                BigDecimal grossRevenue = BigDecimal.ZERO;

                for (Product product : designerProducts) {
                    long sales = product.getDownloadsCount() != null ? product.getDownloadsCount() : 0L;
                    totalSales += sales;
                    BigDecimal minFilePrice = (product.getFiles() != null && !product.getFiles().isEmpty())
                            ? product.getFiles().stream().map(com.adhiemb.module.product.entity.ProductFileData::getPrice).filter(java.util.Objects::nonNull).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO)
                            : BigDecimal.ZERO;
                    grossRevenue = grossRevenue.add(minFilePrice.multiply(BigDecimal.valueOf(sales)));
                }

                BigDecimal earnings = grossRevenue.multiply(commissionRate)
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

                String fullName = (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();

                payouts.add(new DesignerPayoutDTO(
                        user.getId(),
                        fullName,
                        user.getEmail(),
                        totalSales,
                        grossRevenue,
                        commissionRate,
                        earnings,
                        "PENDING"
                ));
            }
        }

        return payouts;
    }
}
