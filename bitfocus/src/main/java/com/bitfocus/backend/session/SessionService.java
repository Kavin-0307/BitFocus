package com.bitfocus.backend.session;

import com.bitfocus.backend.game.GameService;
import com.bitfocus.backend.task.TaskRepository;

public class SessionService {
	private final SessionRepository sessionRepository;
	private final TaskRepository taskRepository;
	private final GameService gameService;
}
