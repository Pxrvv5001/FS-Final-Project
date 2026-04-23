package com.smartinventorypro.india.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.smartinventorypro.india.model.Product;
import com.smartinventorypro.india.model.StockTransaction;
import com.smartinventorypro.india.model.TransactionType;
import com.smartinventorypro.india.repository.ProductRepository;
import com.smartinventorypro.india.repository.StockTransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class StockService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final ActivityLogService activityLogService;

    @Value("${app.invoice.prefix:INV}")
    private String invoicePrefix;

    public StockTransaction processEntry(Long productId, TransactionType type, Integer quantity, String actor) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        if (type == TransactionType.SALE && product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for sale");
        }

        int updatedQty = switch (type) {
            case OPENING -> quantity;
            case PURCHASE -> product.getStockQuantity() + quantity;
            case SALE -> product.getStockQuantity() - quantity;
        };
        product.setStockQuantity(updatedQty);
        productRepository.save(product);

        String invoice = generateInvoiceNumber(type);
        BigDecimal total = product.getFinalPrice().multiply(BigDecimal.valueOf(quantity));

        StockTransaction tx = StockTransaction.builder()
                .product(product)
                .transactionType(type)
                .quantity(quantity)
                .unitPrice(product.getFinalPrice())
                .totalAmount(total)
                .invoiceNumber(invoice)
                .performedBy(actor)
                .createdAt(LocalDateTime.now())
                .build();

        StockTransaction saved = stockTransactionRepository.save(tx);
        activityLogService.log(actor, type + " entry for " + product.getName() + " qty " + quantity, "STOCK");
        return saved;
    }

    public List<StockTransaction> history() {
        return stockTransactionRepository.findTop100ByOrderByCreatedAtDesc();
    }

    public Map<String, Object> invoice(String invoiceNo) {
        List<StockTransaction> entries = stockTransactionRepository.findByInvoiceNumberOrderByCreatedAtAsc(invoiceNo);
        BigDecimal grandTotal = entries.stream()
                .map(StockTransaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> response = new HashMap<>();
        response.put("invoiceNumber", invoiceNo);
        response.put("entries", entries);
        response.put("grandTotal", grandTotal);
        response.put("generatedAt", LocalDateTime.now());
        return response;
    }

    private String generateInvoiceNumber(TransactionType type) {
        return invoicePrefix + "-" + type.name().charAt(0) + "-" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
}
