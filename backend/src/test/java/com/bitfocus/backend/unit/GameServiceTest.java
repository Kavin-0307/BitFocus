package com.bitfocus.backend.unit;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import com.bitfocus.backend.game.GameService;
import com.bitfocus.backend.session.Session;

class GameServiceTest {

    private final GameService gameService = new GameService(null);

    @Test
    void testCalculateDamagePerfect() {
        Session s = new Session();
        s.setCompleted(true);
        s.setInterruptionCount(0);

        int damage = gameService.calculateDamage(s);

        assertEquals(100, damage);
    }

    @Test
    void testCalculateDamageInterrupted() {
        Session s = new Session();
        s.setCompleted(true);
        s.setInterruptionCount(3);

        int damage = gameService.calculateDamage(s);

        assertEquals(70, damage);
    }

    @Test
    void testMinimumDamage() {
        Session s = new Session();
        s.setCompleted(true);
        s.setInterruptionCount(20);

        int damage = gameService.calculateDamage(s);

        assertEquals(10, damage);
    }
}