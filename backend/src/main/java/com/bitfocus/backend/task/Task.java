package com.bitfocus.backend.task;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="tasks")
public class Task {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long taskId;

    @Column(name="task_title", nullable=false)
    private String taskTitle;

    @Column(name="task_priority", nullable=false)
    private int taskPriority;

    @Column(name="task_deadline")
    private LocalDateTime taskDeadline;

    @Column(name="task_estimated_pomodoros", nullable=false)
    private int estimatedPomodoros;

    @Column(name="task_remaining_pomodoros", nullable=false)
    private int remainingPomodoros;

    @Enumerated(EnumType.STRING)
    @Column(name="task_status", nullable=false)
    private TaskCompletion taskStatus;

    @Column(name="task_createdAt")
    private LocalDateTime createdAt;

    @Column(name="task_max_hp")
    private int maxHP;

    @Column(name="task_current_hp")
    private int currentHP;

    @Column(name="task_topic")
    private String topic;

    @Column(name="task_type")
    private String type;

    @Column(name="task_difficulty")
    private String difficulty;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.remainingPomodoros = this.estimatedPomodoros;
        this.taskStatus = TaskCompletion.ACTIVE;
        this.maxHP = this.estimatedPomodoros * 100;
        this.currentHP = this.maxHP;
    }

    // Getters and Setters
    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }

    public int getTaskPriority() { return taskPriority; }
    public void setTaskPriority(int taskPriority) { this.taskPriority = taskPriority; }

    public LocalDateTime getTaskDeadline() { return taskDeadline; }
    public void setTaskDeadline(LocalDateTime taskDeadline) { this.taskDeadline = taskDeadline; }

    public int getEstimatedPomodoros() { return estimatedPomodoros; }
    public void setEstimatedPomodoros(int estimatedPomodoros) { this.estimatedPomodoros = estimatedPomodoros; }

    public int getRemainingPomodoros() { return remainingPomodoros; }
    public void setRemainingPomodoros(int remainingPomodoros) { this.remainingPomodoros = remainingPomodoros; }

    public TaskCompletion getTaskStatus() { return taskStatus; }
    public void setTaskStatus(TaskCompletion taskStatus) { this.taskStatus = taskStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public int getMaxHP() { return maxHP; }
    public void setMaxHP(int maxHP) { this.maxHP = maxHP; }

    public int getCurrentHP() { return currentHP; }
    public void setCurrentHP(int currentHP) { this.currentHP = currentHP; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    // Game Logic
    public void applyPomodoro(boolean completed) {
        if (this.taskStatus == TaskCompletion.COMPLETED) return;
        if (completed && this.remainingPomodoros > 0) {
            this.remainingPomodoros--;
        }
        if (this.remainingPomodoros == 0 || this.currentHP <= 0) {
            this.taskStatus = TaskCompletion.COMPLETED;
        }
    }

    public void applyDamage(int damage) {
        if (this.taskStatus == TaskCompletion.COMPLETED) return;
        this.currentHP -= damage;
        if (this.currentHP < 0) this.currentHP = 0;
        if (this.currentHP == 0) this.taskStatus = TaskCompletion.COMPLETED;
    }

    public int getDamagePerSession() {
        int base;
        if(this.difficulty == null)
            base = 100;
        else {
            switch(this.difficulty.toUpperCase()) {
                case "LOW":
                    base = 110;
                    break;
                case "HIGH":
                    base = 90;
                    break;
                default:
                    base = 100;
            }
        }
        double progressFactor = 1.0;
        if(this.estimatedPomodoros > 0) {
            progressFactor += 0.4 * ((double)this.remainingPomodoros / this.estimatedPomodoros);
        }
        int randomBoost = new java.util.Random().nextInt(21) - 10;
        int damage = (int)(base * progressFactor) + randomBoost;
        return Math.max(50, Math.min(175, damage));
    }
}
