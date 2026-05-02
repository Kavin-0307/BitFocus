from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from services.nlp import analyze_task

app = FastAPI()

# Enable CORS for the Frontend (5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for the hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskRequest(BaseModel):
    text: str

class TaskInput(BaseModel):
    taskId: int
    priority: int
    remainingPomodoros: int
    hoursToDeadline: int

class RecommendRequest(BaseModel):
    tasks: List[TaskInput]

@app.post("/analyze-task")
async def analyze(req: TaskRequest):
    try:
        result = analyze_task(req.text)
        return result
    except Exception:
        return {
            "estimatedPomodoros": 2,
            "topic": "general",
            "type": "general",
            "difficulty": "MEDIUM"
        }

@app.post("/recommend")
async def recommend(req: RecommendRequest):
    if not req.tasks:
        return {"error": "No tasks provided"}

    best_task_id = -1
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
            best_task_id = t.taskId

    return {
        "taskId": best_task_id,
        "score": best_score,
        "reason": "Combined Priority, Deadline Urgency, and Remaining Work"
    }

@app.get("/health")
def health():
    return {"status": "ok"}