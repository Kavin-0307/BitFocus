package com.bitfocus.backend.session.dtos;

import java.time.LocalDateTime;

public class SessionEndRequestDTO {

    private Long sessionId;
    private Long taskId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private int durationSeconds;

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

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public int getDurationSeconds() {
        return durationSeconds;
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

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public void setDurationSeconds(int durationSeconds) {
        this.durationSeconds = durationSeconds;
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