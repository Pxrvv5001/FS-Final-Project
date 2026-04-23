package com.smartinventorypro.india.controller;

import com.smartinventorypro.india.model.StockTransaction;
import com.smartinventorypro.india.model.TransactionType;
import com.smartinventorypro.india.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @PostMapping("/entry")
    public ResponseEntity<StockTransaction> entry(@RequestBody Map<String, String> request,
                                                  @RequestHeader(value = "X-Actor", defaultValue = "admin") String actor) {
        Long productId = Long.parseLong(request.get("productId"));
        TransactionType type = TransactionType.valueOf(request.get("type").toUpperCase());
        Integer quantity = Integer.parseInt(request.get("quantity"));
        return ResponseEntity.ok(stockService.processEntry(productId, type, quantity, actor));
    }

    @GetMapping("/history")
    public ResponseEntity<List<StockTransaction>> history() {
        return ResponseEntity.ok(stockService.history());
    }

    @GetMapping("/invoice/{invoiceNo}")
    public ResponseEntity<Map<String, Object>> invoice(@PathVariable String invoiceNo) {
        return ResponseEntity.ok(stockService.invoice(invoiceNo));
    }
}
