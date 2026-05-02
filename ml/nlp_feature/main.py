from nlp.sentence_parser import sentence_parsing
from classifiers.task_extractor_model import classification as task_classify
from classifiers.subject_dict_model import classification as subject_classify


def process(text):
    parsed = sentence_parsing(text)

    task_word = parsed["task_word"]
    subject_text = parsed["subject"]

    task_result = task_classify(task_word) if task_word else None
    subject_result = subject_classify(subject_text) if subject_text else None

    return {
        "input": text,
        "parsed": parsed,
        "task": task_result,
        "subject": subject_result
    }


def display(result):
    print("\n--- RESULT ---")
    print("Input:", result["input"])

    print("\nParsed:")
    print("  Task Word:", result["parsed"]["task_word"])
    print("  Subject:", result["parsed"]["subject"])

    print("\nClassification:")

    if result["task"]:
        print("  Task ID:", result["task"]["id"])
    else:
        print("  Task ID: None")

    if result["subject"]:
        print("  Subject ID:", result["subject"]["id"])
    else:
        print("  Subject ID: None")

    print("----------------\n")


def main():
    while True:
        text = input("Enter sentence: ").strip()

        if not text:
            continue

        result = process(text)
        display(result)

        opt = input("Press 1 to continue (anything else to exit): ")
        if opt != "1":
            break


if __name__ == "__main__":
    main()