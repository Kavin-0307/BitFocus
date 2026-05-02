package com.bitfocus.backend.ml;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.bitfocus.backend.ml.dtos.TaskAnalysisResponse;
import com.bitfocus.backend.task.Task;

@Service
public class MLIntegrationService {
    private final RestTemplate restTemplate;
    private static final String ANALYZE_URL = "http://localhost:8001/analyze-task";
    private static final String RECOMMEND_URL = "http://localhost:8001/recommend";

    public MLIntegrationService() {
        this.restTemplate = new RestTemplate();
    }

    public TaskAnalysisResponse analyzeTask(String text) {
        Map<String, String> request = new HashMap<>();
        request.put("text", text);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(ANALYZE_URL, request, Map.class);

            if (response == null) return fallback();

            Integer estimated = 2;
            Object estVal = response.get("estimatedPomodoros");
            if (estVal instanceof Number) {
                estimated = ((Number) estVal).intValue();
            }

            String topic = (String) response.getOrDefault("topic", "general");
            String type = (String) response.getOrDefault("type", "general");
            String difficulty = (String) response.getOrDefault("difficulty", "MEDIUM");

            return new TaskAnalysisResponse(estimated, topic, type, difficulty);

        } catch (Exception e) {
            return fallback();
        }
    }

    public Map<String, Object> recommendTasks(List<Task> tasks) {
        List<Map<String, Object>> taskList = new ArrayList<>();

        for (Task task : tasks) {
            Map<String, Object> t = new HashMap<>();
            t.put("taskId", task.getTaskId());
            t.put("priority", task.getTaskPriority());
            t.put("remainingPomodoros", task.getRemainingPomodoros());

            int hoursToDeadline = 999;
            if (task.getTaskDeadline() != null) {
                hoursToDeadline = (int) Duration.between(LocalDateTime.now(), task.getTaskDeadline()).toHours();
            }
            t.put("hoursToDeadline", hoursToDeadline);
            taskList.add(t);
        }

        Map<String, Object> request = new HashMap<>();
        request.put("tasks", taskList);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(RECOMMEND_URL, request, Map.class);
            return response != null ? response : fallbackRecommend(tasks);
        } catch (Exception e) {
            return fallbackRecommend(tasks);
        }
    }

    private TaskAnalysisResponse fallback() {
        return new TaskAnalysisResponse(2, "general", "general", "MEDIUM");
    }

    private Map<String, Object> fallbackRecommend(List<Task> tasks) {
        Map<String, Object> fallback = new HashMap<>();
        if (!tasks.isEmpty()) {
            fallback.put("taskId", tasks.get(0).getTaskId());
            fallback.put("score", 0);
            fallback.put("reason", "Fallback recommendation");
        }
        return fallback;
    }
}
