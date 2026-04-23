package com.smartinventorypro.india.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartinventorypro.india.model.Supplier;
import com.smartinventorypro.india.repository.SupplierRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final ActivityLogService activityLogService;

    public List<Supplier> getAll() {
        return supplierRepository.findAll();
    }

    public Supplier create(Supplier supplier, String actor) {
        Supplier saved = supplierRepository.save(supplier);
        activityLogService.log(actor, "Created supplier: " + saved.getName(), "SUPPLIER");
        return saved;
    }
}
