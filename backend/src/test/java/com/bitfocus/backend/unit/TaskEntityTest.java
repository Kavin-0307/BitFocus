package com.bitfocus.backend.unit;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import com.bitfocus.backend.task.Task;

class TaskEntityTest {

    @Test
    void testApplyDamage() {
        Task task = new Task();
        task.setEstimatedPomodoros(3);
        task.prePersist();

        int initialHP = task.getCurrentHP();

        task.applyDamage(50);

        assertTrue(task.getCurrentHP() < initialHP);
    }

    @Test
    void testApplyPomodoro() {
        Task task = new Task();
        task.setEstimatedPomodoros(3);
        task.prePersist();

        task.applyPomodoro(true);

        assertEquals(2, task.getRemainingPomodoros());
    }
}