package com.bitfocus.backend.task.dtos;

import java.time.LocalDateTime;
import com.bitfocus.backend.task.TaskCompletion;

public record TaskResponseDTO(
	    Long taskId,
	    String taskTitle,
	    int taskPriority,
	    LocalDateTime taskDeadline,
	    int estimatedPomodoros,
	    int remainingPomodoros,
	    int maxHP,
	    int currentHP,
	    TaskCompletion taskStatus,
	    LocalDateTime createdAt
	) {}