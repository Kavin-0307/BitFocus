package com.bitfocus.backend;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.bitfocus.backend.task.TaskService;
@Component
public class TestRunner implements CommandLineRunner {

    private final TaskService taskService;

    public TestRunner(TaskService taskService) {
        this.taskService = taskService;
    }

    @Override
    public void run(String... args) {

        // 👉 use an existing taskId from DB
        Long taskId = 1L;

        System.out.println("---- TEST START ----");

        for (int i = 0; i < 5; i++) {
            System.out.println("Session " + (i + 1));
            taskService.simulatePomodoro(taskId, true);
        }

        System.out.println("---- TEST END ----");
    }
}