package com.bitfocus.backend.session;

import com.bitfocus.backend.game.GameService;
import com.bitfocus.backend.task.TaskRepository;
import com.bitfocus.backend.task.TaskService;
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
		Task task=taskRepository.findById(getTaskId()).orElseThrow(()->new IllegalArgumentException("Task not found"));
	}

	public TaskResponseDTO endSession(SessionEndRequestDTO request);
}
