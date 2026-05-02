package com.bitfocus.backend;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.bitfocus.backend.task.TaskService;
import com.bitfocus.backend.task.dtos.TaskRequestDTO;
import com.bitfocus.backend.task.dtos.TaskResponseDTO;
@Component
public class TestRunner implements CommandLineRunner {

    private final TaskService taskService;

    public TestRunner(TaskService taskService) {
        this.taskService = taskService;
    }

    @Override
    public void run(String... args) {

        System.out.println("---- TEST START ----");

        // ✅ ALWAYS CREATE TASK FIRST
        TaskRequestDTO req = new TaskRequestDTO();
        req.setTaskTitle("Study CPU Scheduling");
        req.setTaskPriority(2);
        req.setEstimatedPomodoros(0); // forces ML

        TaskResponseDTO task = taskService.createTask(req);

        Long taskId = task.taskId();

        System.out.println("Created Task ID: " + taskId);

        // ✅ USE THAT ID
        for (int i = 0; i < 5; i++) {
            System.out.println("Session " + (i + 1));
            taskService.simulatePomodoro(taskId, true);
        }

        System.out.println("---- TEST END ----");
    }
}