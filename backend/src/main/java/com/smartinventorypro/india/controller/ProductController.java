package com.smartinventorypro.india.controller;

import com.smartinventorypro.india.model.Product;
import com.smartinventorypro.india.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<Product>> products(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "all") String category,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return ResponseEntity.ok(productService.getProducts(page, size, search, category, sortBy, direction));
    }

    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product product,
                                          @RequestHeader(value = "X-Actor", defaultValue = "admin") String actor) {
        return ResponseEntity.ok(productService.create(product, actor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id,
                                          @RequestBody Product product,
                                          @RequestHeader(value = "X-Actor", defaultValue = "admin") String actor) {
        return ResponseEntity.ok(productService.update(id, product, actor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
                                    @RequestHeader(value = "X-Actor", defaultValue = "admin") String actor) {
        productService.delete(id, actor);
        return ResponseEntity.ok().build();
    }
}
