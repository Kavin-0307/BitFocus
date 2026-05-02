package com.bitfocus.backend.ml.dtos;
public record TaskAnalysisResponse (

     Integer estimatedPomodoros,
    String topic,
    String type,
    String difficulty) {

}