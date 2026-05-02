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

import jakarta.transaction.Transactional;
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
	public Long startSession(SessionStartRequestDTO request) {
		Task task=taskRepository.findById(request.getTaskId()).orElseThrow(()->new IllegalArgumentException("Task not found"));
		if(task.getTaskStatus()==TaskCompletion.COMPLETED||task.getTaskStatus()==TaskCompletion.ABANDONED) {
				throw new IllegalArgumentException("Cannot start session for inactive task");
		}
		Session session=new Session();
		session.setTask(task);
		session.setStartTime(LocalDateTime.now());
		Session saved = sessionRepository.save(session);
		return saved.getSessionId();
	}

	@Transactional
	public TaskResponseDTO endSession(SessionEndRequestDTO request) {
		Session session=sessionRepository.findById(request.getSessionId()).orElseThrow(()->new IllegalArgumentException("Session not found"));
		if (request.getEndTime().isBefore(session.getStartTime())) {
		    throw new IllegalArgumentException("End time cannot be before start time");
		}
		if(session.getEndTime()!=null)
			throw new IllegalStateException("Session already ended");
		Task task=session.getTask();
		if (request.getInterruptionCount() > 60) {
		    throw new IllegalArgumentException("Too many interruptions");
		}
		session.setEndTime(request.getEndTime());
		session.setCompleted(request.isCompleted());
		session.setInterruptionCount(request.getInterruptionCount());
		session.setEnergyLevel(request.getEnergyLevel());
		
		long duration = Duration.between(session.getStartTime(), request.getEndTime()).getSeconds();

		if (duration < 60) {
		    throw new IllegalArgumentException("Session too short");
		}

		if (duration > 7200) {
		    throw new IllegalArgumentException("Session too long");
		}
		session.setDurationSeconds((int)duration);
		sessionRepository.save(session);
		sessionRepository.save(session);
		if (!session.isPomodoroApplied() && session.isCompleted()) {
		    task.applyPomodoro(true);
		    session.setPomodoroApplied(true);
		}
		int damage=gameService.calculateDamage(session);
		Task updatedTask=gameService.applyDamage(task.getTaskId(),damage,session.isCompleted());
		return taskService.getTaskById(updatedTask.getTaskId());
	}
}
