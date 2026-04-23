package com.smartinventorypro.india.controller;

import com.smartinventorypro.india.model.Supplier;
import com.smartinventorypro.india.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ResponseEntity<List<Supplier>> all() {
        return ResponseEntity.ok(supplierService.getAll());
    }

    @PostMapping
    public ResponseEntity<Supplier> create(@RequestBody Supplier supplier,
                                           @RequestHeader(value = "X-Actor", defaultValue = "admin") String actor) {
        return ResponseEntity.ok(supplierService.create(supplier, actor));
    }
}
