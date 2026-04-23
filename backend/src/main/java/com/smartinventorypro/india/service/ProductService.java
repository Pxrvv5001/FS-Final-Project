package com.smartinventorypro.india.service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.smartinventorypro.india.model.Product;
import com.smartinventorypro.india.repository.ProductRepository;
import com.smartinventorypro.india.repository.SupplierRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final ActivityLogService activityLogService;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PRODUCT_MODULE = "PRODUCT";

    public Page<Product> getProducts(int page, int size, String search, String category, String sortBy, String direction) {
        Sort sort = Sort.by(Sort.Direction.fromOptionalString(direction).orElse(Sort.Direction.ASC), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> specification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("brand")), like),
                        cb.like(cb.lower(root.get("itemCode")), like)
                ));
            }
            if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };

        return productRepository.findAll(specification, pageable);
    }

    public Product create(Product product, String actor) {
        if (product.getItemCode() == null || product.getItemCode().isBlank()) {
            product.setItemCode(generateSku(product));
        }
        if (product.getSupplier() != null && product.getSupplier().getId() != null) {
            product.setSupplier(supplierRepository.findById(product.getSupplier().getId()).orElse(null));
        }
        Product saved = productRepository.save(product);
        activityLogService.log(actor, "Created product: " + saved.getName(), PRODUCT_MODULE);
        return saved;
    }

    public Product update(Long id, Product product, String actor) {
        Product existing = productRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Product not found"));
        if (product.getItemCode() != null && !product.getItemCode().isBlank()) {
            existing.setItemCode(product.getItemCode());
        }
        existing.setName(product.getName());
        existing.setCategory(product.getCategory());
        existing.setBrand(product.getBrand());
        existing.setVariant(product.getVariant());
        existing.setCity(product.getCity());
        existing.setState(product.getState());
        existing.setBasePrice(product.getBasePrice());
        existing.setGstPercent(product.getGstPercent());
        existing.setFinalPrice(product.getFinalPrice());
        existing.setStockQuantity(product.getStockQuantity());
        existing.setReorderLevel(product.getReorderLevel());
        existing.setImageUrl(product.getImageUrl());
        if (product.getSupplier() != null && product.getSupplier().getId() != null) {
            existing.setSupplier(supplierRepository.findById(product.getSupplier().getId()).orElse(null));
        }
        Product saved = productRepository.save(existing);
        activityLogService.log(actor, "Updated product: " + saved.getName(), PRODUCT_MODULE);
        return saved;
    }

    public void delete(Long id, String actor) {
        Product existing = productRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Product not found"));
        productRepository.deleteById(id);
        activityLogService.log(actor, "Deleted product: " + existing.getName(), PRODUCT_MODULE);
    }

    private String generateSku(Product product) {
        String category = product.getCategory() == null ? "GEN" : product.getCategory();
        String name = product.getName() == null ? "ITEM" : product.getName();

        String catPrefix = category.replaceAll("[^A-Za-z0-9]", "")
                .toUpperCase(Locale.ROOT);
        if (catPrefix.length() > 3) {
            catPrefix = catPrefix.substring(0, 3);
        }
        if (catPrefix.isBlank()) {
            catPrefix = "GEN";
        }

        String namePrefix = name.replaceAll("[^A-Za-z0-9]", "")
                .toUpperCase(Locale.ROOT);
        if (namePrefix.length() > 3) {
            namePrefix = namePrefix.substring(0, 3);
        }
        if (namePrefix.isBlank()) {
            namePrefix = "ITM";
        }

        int suffix = 1000 + RANDOM.nextInt(9000);
        return catPrefix + "-" + namePrefix + "-" + suffix;
    }
}
