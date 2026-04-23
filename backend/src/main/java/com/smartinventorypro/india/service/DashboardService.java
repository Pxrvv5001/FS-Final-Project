package com.smartinventorypro.india.service;

import com.smartinventorypro.india.model.Product;
import com.smartinventorypro.india.model.StockTransaction;
import com.smartinventorypro.india.model.TransactionType;
import com.smartinventorypro.india.repository.ActivityLogRepository;
import com.smartinventorypro.india.repository.ProductRepository;
import com.smartinventorypro.india.repository.StockTransactionRepository;
import com.smartinventorypro.india.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
        private final StockTransactionRepository stockTransactionRepository;
        private final ActivityLogRepository activityLogRepository;

    public Map<String, Object> summary() {
        List<Product> products = productRepository.findAll();

        long lowStock = products.stream()
                .filter(p -> p.getStockQuantity() <= p.getReorderLevel())
                .count();

        BigDecimal inventoryValue = products.stream()
                .map(p -> p.getFinalPrice().multiply(BigDecimal.valueOf(p.getStockQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> categoryCounts = products.stream()
                .collect(Collectors.groupingBy(Product::getCategory, Collectors.counting()));

        Map<String, Integer> stockByCategory = products.stream()
                .collect(Collectors.groupingBy(Product::getCategory,
                        Collectors.summingInt(Product::getStockQuantity)));

        List<StockTransaction> transactions = stockTransactionRepository.findTop100ByOrderByCreatedAtDesc();

        Map<String, Integer> salesTrend = transactions.stream()
                .filter(tx -> tx.getTransactionType() == TransactionType.SALE)
                .filter(tx -> tx.getCreatedAt().toLocalDate().isAfter(LocalDate.now().minusDays(31)))
                .collect(Collectors.groupingBy(
                        tx -> tx.getCreatedAt().toLocalDate().toString(),
                        LinkedHashMap::new,
                        Collectors.summingInt(StockTransaction::getQuantity)
                ));

        List<Map<String, Object>> topSellingProducts = transactions.stream()
                .filter(tx -> tx.getTransactionType() == TransactionType.SALE)
                .collect(Collectors.groupingBy(
                        tx -> tx.getProduct().getName(),
                        Collectors.summingInt(StockTransaction::getQuantity)
                ))
                .entrySet()
                .stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(entry -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("product", entry.getKey());
                    row.put("qty", entry.getValue());
                    return row;
                })
                .toList();

        List<Map<String, Object>> lowStockSummary = products.stream()
                .filter(p -> p.getStockQuantity() <= p.getReorderLevel())
                .sorted((a, b) -> Integer.compare(a.getStockQuantity(), b.getStockQuantity()))
                .limit(8)
                .map(product -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("name", product.getName());
                    row.put("stockQuantity", product.getStockQuantity());
                    row.put("reorderLevel", product.getReorderLevel());
                    return row;
                })
                .toList();

        List<Map<String, Object>> recentStockEntries = transactions.stream()
                .limit(5)
                .map(tx -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("product", tx.getProduct().getName());
                    row.put("type", tx.getTransactionType().name());
                    row.put("quantity", tx.getQuantity());
                    row.put("invoice", tx.getInvoiceNumber());
                    row.put("createdAt", tx.getCreatedAt());
                    row.put("actor", tx.getPerformedBy());
                    return row;
                })
                .toList();

        Map<String, Integer> saleQtyByProduct = transactions.stream()
                .filter(tx -> tx.getTransactionType() == TransactionType.SALE)
                .collect(Collectors.groupingBy(
                        tx -> tx.getProduct().getName(),
                        Collectors.summingInt(StockTransaction::getQuantity)
                ));

        List<String> fastMoving = saleQtyByProduct.entrySet().stream()
                .filter(entry -> entry.getValue() >= 20)
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(Map.Entry::getKey)
                .toList();

        List<String> slowMoving = saleQtyByProduct.entrySet().stream()
                .filter(entry -> entry.getValue() > 0 && entry.getValue() < 5)
                .sorted(Map.Entry.comparingByValue())
                .limit(5)
                .map(Map.Entry::getKey)
                .toList();

        List<String> deadStock = products.stream()
                .filter(product -> !saleQtyByProduct.containsKey(product.getName()))
                .filter(product -> product.getStockQuantity() > 0)
                .map(Product::getName)
                .limit(5)
                .toList();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("fastMoving", fastMoving);
        analytics.put("slowMoving", slowMoving);
        analytics.put("deadStock", deadStock);

        Map<String, Object> response = new HashMap<>();
        response.put("totalProducts", products.size());
        response.put("lowStock", lowStock);
        response.put("suppliers", supplierRepository.count());
        response.put("inventoryValue", inventoryValue);
        response.put("categoryCounts", categoryCounts);
        response.put("stockByCategory", stockByCategory);
        response.put("salesTrend", salesTrend);
        response.put("topSellingProducts", topSellingProducts);
        response.put("lowStockSummary", lowStockSummary);
        response.put("recentStockEntries", recentStockEntries);
        response.put("analytics", analytics);
        response.put("recentActivity", activityLogRepository.findTop50ByOrderByCreatedAtDesc().stream().limit(5).toList());
        return response;
    }
}
