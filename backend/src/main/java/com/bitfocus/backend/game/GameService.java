package com.bitfocus.backend.game;

import org.springframework.stereotype.Service;

import com.bitfocus.backend.session.Session;
import com.bitfocus.backend.task.Task;
import com.bitfocus.backend.task.TaskCompletion;
import com.bitfocus.backend.task.TaskRepository;

@Service
public class GameService {

    private final TaskRepository taskRepository;

    public GameService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public int calculateDamage(Session session) {
    	int base=0;
    	if(session.isCompleted()==true)
    		base=100;
    	else
    		base=40;
    	
    	int penalty=session.getInterruptionCount()*10;
    	int damage=base-penalty;
    	return Math.max(damage,10);
    }

    public Task applyDamage(Long taskId, int damage, boolean completed) {
    	Task task =taskRepository.findById(taskId).orElseThrow(()->new IllegalArgumentException("Task not found"));
    	if(task.getTaskStatus()==TaskCompletion.ABANDONED||task.getTaskStatus()==TaskCompletion.COMPLETED)
    		throw new IllegalArgumentException("Task not active");
    	task.applyDamage(damage);
    	
    	Task updatedTask=taskRepository.save(task);
    	return updatedTask;
    }
}