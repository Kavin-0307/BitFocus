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
		        System.out.println("ML CALL → analyzeTask: " + text);

		        Map<String, Object> response =
		                restTemplate.postForObject(ANALYZE_URL, request, Map.class);

		        // ---- SAFE MAPPING ----
		        Integer estimated = 2;

		        if (response != null) {
		            Object val = response.get("estimatedPomodoros");
		            if (val instanceof Number) {
		                estimated = ((Number) val).intValue();
		            }
		        }

		        String topic = response != null ? (String) response.get("topic") : null;
		        String type = response != null ? (String) response.get("type") : null;
		        String difficulty = response != null ? (String) response.get("difficulty") : null;

		        TaskAnalysisResponse result =
		                new TaskAnalysisResponse(estimated, topic, type, difficulty);

		        System.out.println("ML RESPONSE → " + result);

		        return result;

		    } catch (Exception e) {

		        System.out.println("ML FAILED → using fallback");

		        // ---- FALLBACK (NEVER NULL) ----
		        return new TaskAnalysisResponse(
		                2,
		                "general",
		                "general",
		                "MEDIUM"
		        );
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
	                long hours = Duration.between(
	                        LocalDateTime.now(),
	                        task.getTaskDeadline()
	                ).toHours();

	                hoursToDeadline = (int) hours;
	            }

	            t.put("hoursToDeadline", hoursToDeadline);

	            taskList.add(t);
	        }

	        Map<String, Object> request = new HashMap<>();
	        request.put("tasks", taskList);

	        try {
	            return restTemplate.postForObject(RECOMMEND_URL, request, Map.class);
	        } catch (Exception e) {
	            // fallback → pick first task
	            Map<String, Object> fallback = new HashMap<>();

	            if (!tasks.isEmpty()) {
	                fallback.put("taskId", tasks.get(0).getTaskId());
	                fallback.put("score", 0);
	                fallback.put("reason", "Fallback recommendation");
	            }

	            return fallback;
	        }
	    }

}
