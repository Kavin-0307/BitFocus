package com.bitfocus.backend.session;
import jakarta.persistence.*;
import java.time.*;

import com.bitfocus.backend.task.Task;
@Entity
@Table(name="sessions")

public class Session {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long sessionId;
	
	@ManyToOne(fetch=FetchType.LAZY,optional=false)
	@JoinColumn(name="task_id",nullable=false)
	private Task task;
	
	@Column(name="session_start_time",nullable=false)
	private LocalDateTime startTime;
	@Column(name="session_end_time",nullable=false)
	private LocalDateTime endTime;
	
	private int durationSeconds;
	
	@Column(name="session_completed",nullable=false)
	private boolean completed;
	
	@Column(name="session_interruption_count",nullable=false)
	private int interruptionCount;
	
	@Column(name="energy_level",nullable=true)
	private int energyLevel;
	@Column(name = "pomodoro_applied")
	private boolean pomodoroApplied = false;

	
	
	public Long getSessionId() {
        return sessionId;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task= task;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public int getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(int durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public int getInterruptionCount() {
        return interruptionCount;
    }

    public void setInterruptionCount(int interruptionCount) {
        this.interruptionCount = interruptionCount;
    }

    public int getEnergyLevel() {
        return energyLevel;
    }

    public void setEnergyLevel(int energyLevel) {
        this.energyLevel = energyLevel;
    }

	public boolean isPomodoroApplied() {
		
		return pomodoroApplied;
	}
	public void setPomodoroApplied(boolean pomodoroApplied) {
		this.pomodoroApplied=pomodoroApplied;
	}
	
}

