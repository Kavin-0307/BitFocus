import json
import os
import spacy

# Load spaCy model once at module level
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    # Fallback if model not found
    nlp = None

def load_subjects():
    path = os.path.join(os.path.dirname(__file__), "subjects-representation.json")
    try:
        with open(path, "r") as f:
            return json.load(f)
    except Exception:
        return {"categories": []}

SUBJECTS_DATA = load_subjects()

# Precompute embeddings for categories if nlp is available
CATEGORY_DOCS = []
if nlp:
    for cat in SUBJECTS_DATA.get("categories", []):
        cat_id = cat["id"]
        # Combine aliases into a single text for a representative embedding
        combined_text = " ".join(cat.get("aliases", []))
        CATEGORY_DOCS.append({
            "id": cat_id,
            "doc": nlp(combined_text),
            "aliases": [a.lower() for a in cat.get("aliases", [])]
        })

def classify_subject(text: str) -> str:
    if not text:
        return "general"
    
    text_lower = text.lower()

    # 1. Direct Rule Priority for CS
    cs_keywords = ["os", "operating system", "dbms", "network", "computer network", "cpu scheduling"]
    if any(kw in text_lower for kw in cs_keywords):
        return "core_cs"

    # 2. Direct Alias Match
    for cat in CATEGORY_DOCS:
        if any(alias in text_lower for alias in cat["aliases"]):
            return cat["id"]

    # 3. Similarity Match
    if nlp:
        input_doc = nlp(text_lower)
        best_cat = "general"
        best_score = 0.6  # Threshold

        for cat in CATEGORY_DOCS:
            score = input_doc.similarity(cat["doc"])
            if score > best_score:
                best_score = score
                best_cat = cat["id"]
        
        return best_cat

    return "general"