
package com.bitfocus.backend.stats;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import com.bitfocus.backend.ml.MLIntegrationService;
import com.bitfocus.backend.session.Session;
import com.bitfocus.backend.session.SessionRepository;
import com.bitfocus.backend.task.Task;
import com.bitfocus.backend.task.TaskCompletion;
import com.bitfocus.backend.task.TaskRepository;

@Service
public class StatsService {

    private final MLIntegrationService mlService;

	
	private final SessionRepository sessionRepository;
	private final TaskRepository taskRepository;
	public StatsService(TaskRepository taskRepository,SessionRepository sessionRepository, MLIntegrationService mlService) {
		this.sessionRepository=sessionRepository;
		this.taskRepository=taskRepository;
		this.mlService=mlService;
	}
	public Map<String, Object> getRecommendation() {

	    List<Task> activeTasks = taskRepository.findAll()
	            .stream()
	            .filter(task -> task.getTaskStatus() == TaskCompletion.ACTIVE)
	            .collect(Collectors.toList());

	    if (activeTasks.isEmpty()) {
	        return Map.of("message", "No active tasks");
	    }

	    return mlService.recommendTasks(activeTasks);
	}
	
	public StatsResponseDTO getStats() {
		List<Session> sessions=sessionRepository.findAll();
		List<Task> tasks=taskRepository.findAll();
		
		
		int totalFocusTime=sessions.stream().filter(s->s.getEndTime()!=null).mapToInt(Session::getDurationSeconds).sum();
		int totalSessions = (int) sessions.stream().filter(s->s.getEndTime()!=null).count();
		
		
		
		long completedTasks=tasks.stream().filter(t->t.getTaskStatus()==TaskCompletion.COMPLETED).count();
		long totalTasks=tasks.size();
		
        double completionRate=totalTasks==0?0:((double)completedTasks/ totalTasks)*100;
		int productivityScore=(totalSessions*10)+(int)(completionRate*50);
		return new StatsResponseDTO(totalSessions,totalFocusTime,completionRate,productivityScore);
		
		
	}
}