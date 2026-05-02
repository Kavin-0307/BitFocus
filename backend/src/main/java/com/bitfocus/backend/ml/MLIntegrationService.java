package com.bitfocus.backend.ml;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.bitfocus.backend.task.Task;

@Service
public class MLIntegrationService {
	 private final RestTemplate restTemplate;
	 private static final String ANALYZE_URL = "http://localhost:8001/analyze-task";
	 private static final String RECOMMEND_URL = "http://localhost:8001/recommend";
	 public MLIntegrationService() {
	        this.restTemplate = new RestTemplate();
	    }
	 public Map<String,Object> analyzeTask(String text){
		 Map<String,String> request=new HashMap<>();
		 request.put("text", text);
		 try {
			 return restTemplate.postForObject(ANALYZE_URL,request,Map.class);
		 }catch (Exception e) {
	            // fallback
	            Map<String, Object> fallback = new HashMap<>();
	            fallback.put("topic", "general");
	            fallback.put("type", "general");
	            fallback.put("difficulty", "MEDIUM");
	            fallback.put("estimatedPomodoros", 2);
	            return fallback;
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
