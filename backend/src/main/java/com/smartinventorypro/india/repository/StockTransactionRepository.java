package com.smartinventorypro.india.repository;

import com.smartinventorypro.india.model.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    List<StockTransaction> findTop100ByOrderByCreatedAtDesc();
    List<StockTransaction> findByInvoiceNumberOrderByCreatedAtAsc(String invoiceNumber);
}
