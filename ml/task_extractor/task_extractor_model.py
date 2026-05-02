import json
import os
import spacy

# Load spaCy model once
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

def load_tasks():
    path = os.path.join(os.path.dirname(__file__), "task_glossary.json")
    try:
        with open(path, "r") as f:
            return json.load(f)
    except Exception:
        return {"tasks": []}

TASKS_DATA = load_tasks()

TASK_DOCS = []
if nlp:
    for task in TASKS_DATA.get("tasks", []):
        task_id = task["id"]
        combined_text = " ".join(task.get("aliases", []))
        TASK_DOCS.append({
            "id": task_id,
            "doc": nlp(combined_text),
            "aliases": [a.lower() for a in task.get("aliases", [])]
        })

def extract_task_type(text: str) -> str:
    if not text:
        return "general"
    
    text_lower = text.lower()

    # 1. Rule Priority
    if "study" in text_lower: return "study"
    if "revise" in text_lower: return "revision"
    if "read" in text_lower: return "reading"
    if "assignment" in text_lower or "project" in text_lower: return "assignment"

    # 2. Direct Alias Match
    for task in TASK_DOCS:
        if any(alias in text_lower for alias in task["aliases"]):
            return task["id"]

    # 3. Similarity Fallback
    if nlp:
        input_doc = nlp(text_lower)
        best_task = "general"
        best_score = 0.6  # Threshold

        for task in TASK_DOCS:
            score = input_doc.similarity(task["doc"])
            if score > best_score:
                best_score = score
                best_task = task["id"]
        
        return best_task

    return "general"