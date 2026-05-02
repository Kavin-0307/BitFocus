import joblib
import os
from subject_dict_model.subject_dict_model import classify_subject
from task_extractor.task_extractor_model import extract_task_type

# Load models safely
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MODEL_PATH = os.path.join(MODELS_DIR, "model.pkl")
VECT_PATH = os.path.join(MODELS_DIR, "vectorizer.pkl")

try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECT_PATH)
    ML_ENABLED = True
except Exception:
    ML_ENABLED = False

def rule_based_estimate(text: str) -> int:
    text_lower = text.lower()
    if "read" in text_lower:
        return 1
    if "revise" in text_lower or "review" in text_lower:
        return 2
    if "study" in text_lower:
        return 3
    if "assignment" in text_lower or "project" in text_lower:
        return 4
    return 2

def ml_estimate(text: str) -> int:
    if not ML_ENABLED:
        raise Exception("ML model not loaded")
    X = vectorizer.transform([text])
    prediction = model.predict(X)[0]
    return int(prediction)

def difficulty_logic(estimated: int) -> str:
    if estimated <= 1:
        return "LOW"
    elif estimated <= 3:
        return "MEDIUM"
    else:
        return "HIGH"

def safe_subject(text: str) -> str:
    try:
        res = classify_subject(text)
        return str(res) if res else "general"
    except Exception:
        return "general"

def safe_type(text: str) -> str:
    try:
        res = extract_task_type(text)
        return str(res) if res else "general"
    except Exception:
        return "general"

def analyze_task(text: str):
    rule_est = rule_based_estimate(text)

    try:
        if ML_ENABLED:
            ml_est = ml_estimate(text)
        else:
            ml_est = rule_est
    except Exception:
        ml_est = rule_est

    # Weighted average: 60% rule, 40% ML
    final_est = int(0.6 * rule_est + 0.4 * ml_est)
    final_est = max(1, final_est)

    topic = safe_subject(text)
    type_ = safe_type(text)
    difficulty = difficulty_logic(final_est)

    return {
        "estimatedPomodoros": final_est,
        "topic": topic,
        "type": type_,
        "difficulty": difficulty
    }