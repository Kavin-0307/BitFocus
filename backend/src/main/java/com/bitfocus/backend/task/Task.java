package com.bitfocus.backend.task;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="tasks")
public class Task {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long taskId;
	@Column(name="task_title",nullable=false)
	private String taskTitle;
	@Column(name="task_priority",nullable=false)
	private int taskPriority;
	@Column(name="task_deadline")
	private LocalDateTime taskDeadline;
	@Column(name="task_estimated_pomodoros",nullable=false)
	private int estimatedPomodoros;
	@Column(name="task_remaining_pomodoros",nullable=false)
	private int remainingPomodoros;
	@Enumerated(EnumType.STRING)
	@Column(name="task_status",nullable=false)
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
		this.createdAt=LocalDateTime.now();
		this.remainingPomodoros=this.estimatedPomodoros;
		this.taskStatus=TaskCompletion.ACTIVE;
		this.maxHP = this.estimatedPomodoros * 100;
		this.currentHP = this.maxHP;
	}
	public String getTopic() {
        return topic;
    }

    public String getType() {
        return type;
    }

    public String getDifficulty() {
        return difficulty;
    }

	public TaskCompletion getTaskStatus() {
		return taskStatus;
	}
	public long getTaskId() {
		return taskId;
	}
	public String getTaskTitle() {
		return taskTitle;
	}
	public int getEstimatedPomodoros() {
		return estimatedPomodoros;
	}
	public LocalDateTime getTaskDeadline() {
		return taskDeadline;
	}
	public int getRemainingPomodoros() {
		return remainingPomodoros;
	}
	public int getTaskPriority() {
		return taskPriority;
	}
	
	
	
	
	public void setTaskStatus(TaskCompletion taskStatus) {
		this.taskStatus=taskStatus;
	}
	public void setTaskId(long taskId) {
		this.taskId=taskId;
	}
	public void setTaskTitle(String taskTitle) {
		this.taskTitle=taskTitle;
	}
	public void setTaskPriority(int taskPriority) {
		this.taskPriority=taskPriority;
	}
	public void setTaskDeadline(LocalDateTime taskDeadline) {
		this.taskDeadline=taskDeadline;
	}
	public void setRemainingPomodoros(int remainingPomodoros) {
		if(remainingPomodoros<0) {
			throw new IllegalArgumentException("Remaining Pomodoros cannot be negative");
		}
		this.remainingPomodoros=remainingPomodoros;
	}
	public void setEstimatedPomodoros(int estimatedPomodoros) {
		this.estimatedPomodoros=estimatedPomodoros;
	}
	public boolean isCompleted() {
	    return this.taskStatus == TaskCompletion.COMPLETED;
	}
	public void setTopic(String topic) {
        this.topic = topic;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
    
    
    
    
    
	public int getMaxHP() {
	    return this.maxHP;
	}
	public int getCurrentHP() {
		return this.currentHP;
	}
	public void applyPomodoro(boolean completed) {

	    if (this.taskStatus == TaskCompletion.COMPLETED) return;

	    if (completed && this.remainingPomodoros > 0) {

	        this.remainingPomodoros--;

	        int damage = getDamagePerSession();
	        applyDamage(damage);

	        System.out.println("Damage: " + damage + " | Difficulty: " + difficulty);
	    }

	    if (this.remainingPomodoros == 0 || this.currentHP == 0) {
	        this.taskStatus = TaskCompletion.COMPLETED;
	    }
	}
	public void applyDamage(int damage) {
	    if (this.taskStatus == TaskCompletion.COMPLETED) return;

	    this.currentHP -= damage;

	    if (this.currentHP < 0) {
	        this.currentHP = 0;
	    }

	}
	public int getDamagePerSession() {
		int base;
		if(this.difficulty==null)
			base=100;
		else {
			switch(this.difficulty.toUpperCase()) {
			case "EASY":
				base=110;
				break;
			case "HARD":
				base=90;
				break;
			default:
				base=100;
			}
			
		}
		double progressFactor=1.0;
		if(this.estimatedPomodoros>0) {
			progressFactor+=0.4*((double)this.remainingPomodoros/this.estimatedPomodoros);
		}
		int randomBoost=new java.util.Random().nextInt(21)-10;
		int damage=(int)(base*progressFactor)+randomBoost;
		if(damage<50)damage=50;
		if(damage>175)damage=175;
		return damage;
	}

	public LocalDateTime getCreatedAt() {
		
		return createdAt;
	}
	
}
