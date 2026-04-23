package com.smartinventorypro.india.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartinventorypro.india.model.ActivityLog;
import com.smartinventorypro.india.repository.ActivityLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public void log(String actor, String action, String module) {
        ActivityLog entry = ActivityLog.builder()
                .actor(actor)
                .action(action)
                .module(module)
                .createdAt(LocalDateTime.now())
                .build();
        activityLogRepository.save(entry);
    }

    public List<ActivityLog> latest() {
        return activityLogRepository.findTop50ByOrderByCreatedAtDesc();
    }
}
