import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

sys.path.append(os.path.join(BASE_DIR, "subject_dict_model"))
sys.path.append(os.path.join(BASE_DIR, "task_extractor"))

from subject_dict_model import classify_subject
from task_extractor_model import extract_task_type


def analyze_task(text: str):

    topic = classify_subject(text)
    task_type = extract_task_type(text)

    word_count = len(text.split())

    if word_count < 5:
        difficulty = "LOW"
        est = 1
    elif word_count < 12:
        difficulty = "MEDIUM"
        est = 2
    else:
        difficulty = "HIGH"
        est = 3

    return {
        "topic": topic,
        "type": task_type,
        "difficulty": difficulty,
        "estimatedPomodoros": est
    }