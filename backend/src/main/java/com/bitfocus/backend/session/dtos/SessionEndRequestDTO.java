package com.bitfocus.backend.session.dtos;

import java.time.LocalDateTime;

public class SessionEndRequestDTO {

    private Long sessionId;
    private Long taskId;

    private LocalDateTime endTime;

    private boolean completed;

    private int interruptionCount;

    private int energyLevel;

    // Getters

    public Long getSessionId() {
        return sessionId;
    }

    public Long getTaskId() {
        return taskId;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public boolean isCompleted() {
        return completed;
    }

    public int getInterruptionCount() {
        return interruptionCount;
    }

    public int getEnergyLevel() {
        return energyLevel;
    }

    // Setters

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public void setInterruptionCount(int interruptionCount) {
        this.interruptionCount = interruptionCount;
    }

    public void setEnergyLevel(int energyLevel) {
        this.energyLevel = energyLevel;
    }
}