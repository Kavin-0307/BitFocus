import spacy
import json
import os

nlp = spacy.load("en_core_web_md")

BASE_DIR = os.path.dirname(__file__)
file_path = os.path.join(BASE_DIR, "task_glossary.json")

with open(file_path, "r") as f:
    json_file = json.load(f)


def extract_task_type(text: str):
    text = text.lower().strip()

    tasks = json_file["tasks"]

    best_match = 0.0
    best_id = "general"

    # direct match
    for t in tasks:
        if text in t["aliases"]:
            return t["id"]

    # similarity match
    doc_text = nlp(text)

    for t in tasks:
        for alias in t["aliases"]:
            doc_alias = nlp(alias)
            sim = doc_text.similarity(doc_alias)

            if sim > best_match:
                best_match = sim
                best_id = t["id"]

    if best_match > 0.6:
        return best_id

    return "general"