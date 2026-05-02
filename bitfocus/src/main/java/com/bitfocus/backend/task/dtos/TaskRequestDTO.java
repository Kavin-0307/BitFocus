package com.bitfocus.backend.task.dtos;

import java.time.LocalDateTime;

public class TaskRequestDTO {

    private String taskTitle;
    private int taskPriority;
    private LocalDateTime taskDeadline;
    private int estimatedPomodoros;
    private long id;
    // Getters
    public Long getId() {
    	return id;
    }
    public String getTaskTitle() {
        return taskTitle;
    }

    public int getTaskPriority() {
        return taskPriority;
    }

    public LocalDateTime getTaskDeadline() {
        return taskDeadline;
    }

    public int getEstimatedPomodoros() {
        return estimatedPomodoros;
    }

    // Setters

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public void setTaskPriority(int taskPriority) {
        this.taskPriority = taskPriority;
    }

    public void setTaskDeadline(LocalDateTime taskDeadline) {
        this.taskDeadline = taskDeadline;
    }

    public void setEstimatedPomodoros(int estimatedPomodoros) {
        this.estimatedPomodoros = estimatedPomodoros;
    }
}