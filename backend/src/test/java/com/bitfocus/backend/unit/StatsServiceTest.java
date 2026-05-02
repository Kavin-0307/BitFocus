package com.bitfocus.backend.unit;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.bitfocus.backend.stats.StatsService;

@SpringBootTest
class StatsServiceTest {

    @Autowired
    private StatsService statsService;

    @Test
    void testRecommendation() {
        Map<String, Object> result = statsService.getRecommendation();

        System.out.println(result);

        assertNotNull(result);
    }
}
