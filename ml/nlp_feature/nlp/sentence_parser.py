import spacy
nlp = spacy.load("en_core_web_md")

def sentence_parsing(text):
    doc = nlp(text)

    # ✅ 0. Command-style shortcut (CRITICAL FIX)
    tokens = [t for t in doc if not t.is_punct]

    if len(tokens) >= 2 and tokens[0].pos_ == "VERB":
        return {
            "task_word": tokens[0].lemma_.lower(),
            "subject": " ".join([t.text for t in tokens[1:]]).lower()
        }

    task_word = None
    subject = []

    # 1. Prefer xcomp
    for token in doc:
        if token.dep_ == "xcomp" and token.pos_ == "VERB":
            task_word = token
            break

    # 2. ROOT fallback
    if not task_word:
        for token in doc:
            if token.dep_ == "ROOT" and token.pos_ == "VERB":
                task_word = token
                break

    # 3. Final fallback
    if not task_word:
        for token in doc:
            if token.pos_ == "VERB":
                task_word = token
                break

    # 4. Simple fallback subject extraction
    if task_word:
        subject = [
            token.text for token in doc
            if token.i > task_word.i
        ]

    return {
        "task_word": task_word.lemma_.lower() if task_word else None,
        "subject": " ".join(subject).lower() if subject else None
    }