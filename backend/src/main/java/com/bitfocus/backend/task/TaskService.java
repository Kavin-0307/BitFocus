package com.bitfocus.backend.task;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.bitfocus.backend.ml.MLIntegrationService;
import com.bitfocus.backend.task.dtos.TaskRequestDTO;
import com.bitfocus.backend.task.dtos.TaskResponseDTO;



@Service
public class TaskService {
	private final TaskRepository taskRepository;
	private final MLIntegrationService mlService;
	public TaskService(TaskRepository taskRepository,MLIntegrationService mlService){
		this.taskRepository=taskRepository;
		this.mlService=mlService;
	}
	public TaskResponseDTO createTask(TaskRequestDTO request) {
		Task task=new Task();
		task.setTaskTitle(request.getTaskTitle());
		task.setTaskPriority(request.getTaskPriority());
		
		int estimated ;
		

		if (request.getEstimatedPomodoros() > 0) {
		    estimated = request.getEstimatedPomodoros();
		} else {
			 var ml = mlService.analyzeTask(request.getTaskTitle());

	            // ❗ SAFE extraction
	            estimated = (ml.estimatedPomodoros() != null)
	                    ? ml.estimatedPomodoros()
	                    : 2;
	            
		}

		
		task.setEstimatedPomodoros(estimated);
		task.setTaskDeadline(request.getTaskDeadline());
		Task savedTask = taskRepository.save(task);
		return convertToResponseDTO(savedTask);
	}
	public TaskResponseDTO getTaskById(Long id) {
	    Task task=taskRepository.findById(id).orElseThrow(()->new IllegalArgumentException("Task not found"));

	    return convertToResponseDTO(task);
	}
	public void deleteTask(Long taskId) {
	    Task task = taskRepository.findById(taskId)
	            .orElseThrow(() -> new IllegalArgumentException("Task not found"));
	    if (task.getTaskStatus() == TaskCompletion.COMPLETED) {
	        throw new IllegalArgumentException("Cannot abandon completed task");
	    }
	    task.setTaskStatus(TaskCompletion.ABANDONED);

	    taskRepository.save(task);
	}
	 public List<TaskResponseDTO> getAllTasksSorted(){
		 return taskRepository.findAll().stream().filter(task->task.getTaskStatus()==TaskCompletion.ACTIVE).sorted((t1,t2)->Integer.compare(calculatePriorityScore(t2),calculatePriorityScore(t1))).map(this::convertToResponseDTO).toList();
	 }
	 
	 public TaskResponseDTO getTaskState(Long taskId) {
		    Task task = taskRepository.findById(taskId)
		            .orElseThrow(() -> new IllegalArgumentException("Task not found"));

		    return convertToResponseDTO(task);
		}
	 public List<TaskResponseDTO> getActiveTasks() {
		    return taskRepository.findAll().stream()
		            .filter(task -> task.getTaskStatus() == TaskCompletion.ACTIVE)
		            .map(this::convertToResponseDTO)
		            .toList();
		}
	 
	private TaskResponseDTO convertToResponseDTO(Task task) {
		return new TaskResponseDTO(task.getTaskId(),
				task.getTaskTitle(),
				task.getTaskPriority(),
				task.getTaskDeadline(),
				task.getEstimatedPomodoros(),
				task.getRemainingPomodoros(),
				task.getMaxHP(),
				task.getCurrentHP(),
				task.getTaskStatus(),
				task.getCreatedAt());
	}
	
	private int calculatePriorityScore(Task task) {
	    return (task.getTaskPriority() * 2)
	            + (calculateDeadlineUrgency(task) * 5)
	            + task.getRemainingPomodoros();
	}	 
	private int calculateDeadlineUrgency(Task task) {
	    if (task.getTaskDeadline() == null) return 0;

	    long hoursLeft = java.time.Duration.between(
	            java.time.LocalDateTime.now(),
	            task.getTaskDeadline()
	    ).toHours();

	    if (hoursLeft<= 0) return 10;   
	    if (hoursLeft<= 24) return 8;
	    if (hoursLeft<= 72) return 5;
	    if (hoursLeft<= 168) return 3; 

	    return 1; 
	}
}
