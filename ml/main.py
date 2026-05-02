from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

from services.nlp import analyze_task

app = FastAPI()


# -------- MODELS FIRST --------
class TaskRequest(BaseModel):
    text: str


class TaskInput(BaseModel):
    taskId: int
    priority: int
    remainingPomodoros: int
    hoursToDeadline: int


class RecommendRequest(BaseModel):
    tasks: List[TaskInput]


# -------- ROUTES AFTER --------
@app.post("/analyze-task")
def analyze(req: TaskRequest):
    return analyze_task(req.text)


@app.post("/recommend")
def recommend(req: RecommendRequest):
    if not req.tasks:
        return {"error": "No tasks provided"}

    best_task = None
    best_score = -1

    for t in req.tasks:
        urgency = (
            10 if t.hoursToDeadline <= 24
            else 5 if t.hoursToDeadline <= 72
            else 1
        )

        score = (
            t.priority * 2 +
            urgency * 5 +
            t.remainingPomodoros
        )

        if score > best_score:
            best_score = score
            best_task = t

    return {
        "taskId": best_task.taskId,
        "score": best_score,
        "reason": "Priority + deadline urgency + workload"
    }


@app.get("/")
def root():
    return {"message": "ML service running"}


@app.get("/health")
def health():
    return {"status": "ok"}