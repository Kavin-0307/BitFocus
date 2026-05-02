import spacy
import json
import os

nlp = spacy.load("en_core_web_md")



BASE_DIR = os.path.abspath(os.path.dirname(__file__))
file_path = os.path.join(BASE_DIR, "subjects-representation.json")

print("Loading JSON from:", file_path)  # DEBUG
with open(file_path, "r") as f:
    json_file = json.load(f)


def classify_subject(subject: str):
    subject = subject.lower().strip()

    categories = json_file["categories"]

    best_match = 0.0
    best_id_match = "general"

    # direct match
    for cat in categories:
        if subject in cat["aliases"]:
            return cat["id"]

    # similarity match
    doc_sub = nlp(subject)

    for cat in categories:
        for alias in cat["aliases"]:
            doc_alias = nlp(alias)
            sim = doc_sub.similarity(doc_alias)

            if sim > best_match:
                best_match = sim
                best_id_match = cat["id"]

    # threshold
    if best_match > 0.6:
        return best_id_match

    return "general"