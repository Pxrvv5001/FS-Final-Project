package com.smartinventorypro.india.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartinventorypro.india.model.Category;
import com.smartinventorypro.india.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> all() {
        return ResponseEntity.ok(categoryService.all());
    }

    @PostMapping
    public ResponseEntity<Category> create(@RequestBody CategoryRequest request,
                                           @RequestHeader(value = "X-Actor", defaultValue = "admin") String actor) {
        Category category = new Category();
        category.setName(request.name());
        category.setDescription(request.description());
        category.setActive(request.active());
        return ResponseEntity.ok(categoryService.create(category, actor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable Long id,
                                           @RequestBody CategoryRequest request,
                                           @RequestHeader(value = "X-Actor", defaultValue = "admin") String actor) {
        Category category = new Category();
        category.setName(request.name());
        category.setDescription(request.description());
        category.setActive(request.active());
        return ResponseEntity.ok(categoryService.update(id, category, actor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id,
                                                       @RequestHeader(value = "X-Actor", defaultValue = "admin") String actor) {
        categoryService.delete(id, actor);
        return ResponseEntity.ok(Map.of("message", "Category deleted"));
    }

    public record CategoryRequest(String name, String description, Boolean active) {
    }
}
