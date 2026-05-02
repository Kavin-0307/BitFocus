package com.bitfocus.backend.task;

import org.springframework.web.bind.annotation.*;
import com.bitfocus.backend.task.dtos.TaskRequestDTO;
import com.bitfocus.backend.task.dtos.TaskResponseDTO;
import java.util.List;
import java.util.Map;

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

    @GetMapping
    public List<TaskResponseDTO> getAllTasks() {
        return taskService.getAllTasksSorted();
    }

    @GetMapping("/{id}")
    public TaskResponseDTO getTask(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    @PostMapping("/{id}/pomodoro")
    public TaskResponseDTO recordPomodoro(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        boolean completed = payload.getOrDefault("completed", true);
        taskService.simulatePomodoro(id, completed);
        return taskService.getTaskById(id);
    }
}