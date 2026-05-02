package com.bitfocus.backend.session;

import java.time.Duration;
import java.time.LocalDateTime;

import com.bitfocus.backend.game.GameService;
import com.bitfocus.backend.session.dtos.SessionEndRequestDTO;
import com.bitfocus.backend.session.dtos.SessionStartRequestDTO;
import com.bitfocus.backend.task.Task;
import com.bitfocus.backend.task.TaskCompletion;
import com.bitfocus.backend.task.TaskRepository;
import com.bitfocus.backend.task.TaskService;
import com.bitfocus.backend.task.dtos.TaskResponseDTO;
public class SessionService {
	private final SessionRepository sessionRepository;
	private final TaskRepository taskRepository;
	private final GameService gameService;
	private final TaskService taskService;
	public SessionService(TaskService taskService,SessionRepository sessionRepository,TaskRepository taskRepository,GameService gameService) {
		this.sessionRepository=sessionRepository;
		this.taskRepository=taskRepository;
		this.gameService=gameService;		
		this.taskService=taskService;
	}
	public Session startSession(SessionStartRequestDTO request) {
		Task task=taskRepository.findById(request.getTaskId()).orElseThrow(()->new IllegalArgumentException("Task not found"));
		if(task.getTaskStatus()==TaskCompletion.COMPLETED||task.getTaskStatus()==TaskCompletion.ABANDONED) {
				throw new IllegalArgumentException("Cannot start session for inactive task");
		}
		Session session=new Session();
		session.setTask(task);
		session.setStartTime(LocalDateTime.now());
		return sessionRepository.save(session);
	}


	public TaskResponseDTO endSession(SessionEndRequestDTO request) {
		Session session=sessionRepository.findById(request.getSessionId()).orElseThrow(()->new IllegalArgumentException("Session not found"));
		if(session.getEndTime()!=null)
			throw new IllegalStateException("Session already ended");
		Task task=session.getTask();
		
		session.setEndTime(request.getEndTime());
		session.setCompleted(request.isCompleted());
		session.setInterruptionCount(request.getInterruptionCount());
		session.setEnergyLevel(request.getEnergyLevel());
		
		long duration=Duration.between(session.getStartTime(), request.getEndTime()).getSeconds();
		session.setDurationSeconds((int)duration);
		sessionRepository.save(session);
		int damage=gameService.calculateDamage(session);
		Task updatedTask=gameService.applyDamage(task.getTaskId(),damage,session.isCompleted());
		return taskService.getTaskById(updatedTask.getTaskId());
	}
}
