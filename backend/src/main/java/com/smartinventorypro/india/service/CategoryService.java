package com.smartinventorypro.india.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartinventorypro.india.model.Category;
import com.smartinventorypro.india.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CategoryService {

    private static final String CATEGORY_MODULE = "CATEGORY";

    private final CategoryRepository categoryRepository;
    private final ActivityLogService activityLogService;

    public List<Category> all() {
        return categoryRepository.findAll();
    }

    public Category create(Category category, String actor) {
        categoryRepository.findByNameIgnoreCase(category.getName()).ifPresent(existing -> {
            throw new IllegalArgumentException("Category already exists");
        });

        if (category.getActive() == null) {
            category.setActive(true);
        }
        Category saved = categoryRepository.save(category);
        activityLogService.log(actor, "Created category: " + saved.getName(), CATEGORY_MODULE);
        return saved;
    }

    public Category update(Long id, Category category, String actor) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        existing.setActive(category.getActive() == null ? Boolean.TRUE : category.getActive());

        Category saved = categoryRepository.save(existing);
        activityLogService.log(actor, "Updated category: " + saved.getName(), CATEGORY_MODULE);
        return saved;
    }

    public void delete(Long id, String actor) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        categoryRepository.delete(existing);
        activityLogService.log(actor, "Deleted category: " + existing.getName(), CATEGORY_MODULE);
    }
}
