package com.bitfocus.backend.system;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import jakarta.transaction.Transactional;

import com.bitfocus.backend.task.TaskService;
import com.bitfocus.backend.task.TaskCompletion;
import com.bitfocus.backend.task.dtos.TaskRequestDTO;
import com.bitfocus.backend.task.dtos.TaskResponseDTO;
import com.bitfocus.backend.session.SessionService;
import com.bitfocus.backend.session.dtos.SessionEndRequestDTO;
import com.bitfocus.backend.session.dtos.SessionStartRequestDTO;

@SpringBootTest
@Transactional
public class GameFlowSystemTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private SessionService sessionService;

    @Test
    void testPerfectSession() {

        TaskRequestDTO req = new TaskRequestDTO();
        req.setTaskTitle("test task");
        req.setTaskPriority(1);
        req.setEstimatedPomodoros(3);

        TaskResponseDTO task = taskService.createTask(req);

        SessionStartRequestDTO startReq = new SessionStartRequestDTO();
        startReq.setTaskId(task.taskId());

        Long sessionId = sessionService.startSession(startReq);

        SessionEndRequestDTO endReq = new SessionEndRequestDTO();
        endReq.setSessionId(sessionId);
        endReq.setCompleted(true);
        endReq.setInterruptionCount(0);
        endReq.setEndTime(java.time.LocalDateTime.now().plusMinutes(25));

        TaskResponseDTO updated = sessionService.endSession(endReq);

        assertNotNull(updated);
        assertEquals(2, updated.remainingPomodoros());
        assertTrue(updated.currentHP() < updated.maxHP());
        assertNotEquals(TaskCompletion.COMPLETED, updated.taskStatus());
    }

    @Test
    void testInterruptedSession(){

        TaskRequestDTO req = new TaskRequestDTO();
        req.setTaskTitle("test task");
        req.setTaskPriority(1);
        req.setEstimatedPomodoros(3);

        TaskResponseDTO task = taskService.createTask(req);

        SessionStartRequestDTO startReq = new SessionStartRequestDTO();
        startReq.setTaskId(task.taskId());

        Long sessionId = sessionService.startSession(startReq);

        SessionEndRequestDTO endReq = new SessionEndRequestDTO();
        endReq.setSessionId(sessionId);
        endReq.setCompleted(true);
        endReq.setInterruptionCount(3);
        endReq.setEndTime(java.time.LocalDateTime.now().plusMinutes(25));

        TaskResponseDTO updated = sessionService.endSession(endReq);

        assertNotNull(updated);
        assertEquals(2, updated.remainingPomodoros());
        assertTrue(updated.currentHP() < updated.maxHP());

        int damageTaken = updated.maxHP() - updated.currentHP();
        assertTrue(damageTaken < 100);

        assertNotEquals(TaskCompletion.COMPLETED, updated.taskStatus());
    }

    @Test
    void testHeavyInterruption(){

        TaskRequestDTO req = new TaskRequestDTO();
        req.setTaskTitle("test task");
        req.setTaskPriority(1);
        req.setEstimatedPomodoros(3);

        TaskResponseDTO task = taskService.createTask(req);

        SessionStartRequestDTO startReq = new SessionStartRequestDTO();
        startReq.setTaskId(task.taskId());

        Long sessionId = sessionService.startSession(startReq);

        SessionEndRequestDTO endReq = new SessionEndRequestDTO();
        endReq.setSessionId(sessionId);
        endReq.setCompleted(true);
        endReq.setInterruptionCount(20);
        endReq.setEndTime(java.time.LocalDateTime.now().plusMinutes(25));

        TaskResponseDTO updated = sessionService.endSession(endReq);

        int damageTaken = updated.maxHP() - updated.currentHP();

        // minimum damage = 10
        assertTrue(damageTaken >= 10);
    }
}