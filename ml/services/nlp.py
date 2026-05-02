import sys
import os
import pickle
import random

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

sys.path.append(os.path.join(BASE_DIR, "subject_dict_model"))
sys.path.append(os.path.join(BASE_DIR, "task_extractor"))

from subject_dict_model import classify_subject
from task_extractor_model import extract_task_type


# ---- LOAD MODEL ----
with open(os.path.join(BASE_DIR, "models", "model.pkl"), "rb") as f:
    model = pickle.load(f)

with open(os.path.join(BASE_DIR, "models", "vectorizer.pkl"), "rb") as f:
    vectorizer = pickle.load(f)


# ---- RULE-BASED ESTIMATE ----
def rule_based_estimate(text):
    text = text.lower()

    if "revise" in text or "review" in text:
        return 2
    if "study" in text:
        return 3
    if "assignment" in text or "project" in text:
        return 4
    if "read" in text:
        return 1

    return 2  # default


# ---- ML ESTIMATE ----
def ml_estimate(text):
    X = vectorizer.transform([text])
    return int(model.predict(X)[0])


# ---- DIFFICULTY LOGIC ----
def difficulty_logic(estimated):
    if estimated <= 1:
        return "LOW"
    elif estimated <= 3:
        return "MEDIUM"
    else:
        return "HIGH"


# ---- MAIN PIPELINE ----
def analyze_task(text):

    # ---- RULE ----
    rule_est = rule_based_estimate(text)

    # ---- ML ----
    try:
        ml_est = ml_estimate(text)
    except Exception:
        ml_est = rule_est

    # ---- FUSION ----
    final_est = int(0.6 * rule_est + 0.4 * ml_est)

    # clamp (VERY IMPORTANT)
    final_est = max(1, final_est)

    # ---- CLASSIFICATION ----
    topic = classify_subject(text)
    type_ = extract_task_type(text)

    # ---- DIFFICULTY ----
    difficulty = difficulty_logic(final_est)

    return {
        "estimatedPomodoros": final_est,
        "topic": topic,
        "type": type_,
        "difficulty": difficulty
    }