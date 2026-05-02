package com.bitfocus.backend.task;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bitfocus.backend.task.dtos.TaskRequestDTO;
import com.bitfocus.backend.task.dtos.TaskResponseDTO;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public TaskResponseDTO create(@RequestBody TaskRequestDTO req) {
        return taskService.createTask(req);
    }
}