package com.bitfocus.backend.stats;

public record StatsResponseDTO(
        int totalSessions,
        int totalFocusTime,
        double completionRate,
        int productivityScore
) {}