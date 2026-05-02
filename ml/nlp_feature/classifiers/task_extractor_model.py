import spacy;
import json;
from spacy import displacy;
import numpy as np;
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
FILE_PATH = BASE_DIR / "data" / "task_glossary.json"
nlp=spacy.load("en_core_web_md");
file=open(FILE_PATH,'r');
json_file=json.load(file);

def exception_unknown(task):
    print("There seems to be a problem....");
    print("The given task does not accurately maps to any of the defined type of tasks in the local database.");
    task_type=input("Input the type of the given task (in one word): ").lower().strip();
    doc_ttype=nlp(task_type);
    task_json=json_file["tasks"];
    best_match=0.0;
    best_id_match="NULL";
    for task_iterator in task_json:
        doc_json=nlp(task_iterator["id"]);
        simil=doc_ttype.similarity(doc_json);
        if simil>best_match:
            best_match=simil;
            best_id_match=task_iterator["id"];
    if best_match>=0.8:
        for task_iterator in task_json:
            if task_iterator["id"]==best_id_match:
                if task not in task_iterator["aliases"]:
                    task_iterator["aliases"].append(task);
                    print("Added ",task," to previously made task type: ",task_iterator["id"]);
                break;
    else:
        new_id=task_type.lower().strip().replace(' ', '_');
        best_id_match=new_id;
        json_file["tasks"].append({
            "id":new_id,
            "aliases":[task]
        });
        print("Added new task type: ",new_id);
        print("Appeneded new task: ",task);
        best_match=1.0;
    with open(FILE_PATH, "w") as f:
        json.dump(json_file, f, indent=4);
    return {
        "Task":task,
        "id":best_id_match
    }

def classification(task):
    task_json=json_file["tasks"];
    best_match=0.0
    best_id_match="NULL"
    for task_iterator in task_json:
        if task in task_iterator["aliases"]:
            return {
                "Task":task,
                "id":task_iterator["id"]
            };

    doc_task=nlp(task);
    for task_iterator in task_json:
        for alias in task_iterator["aliases"]:
            doc_ali=nlp(alias);
            similar=doc_task.similarity(doc_ali);
            if similar>best_match:
                best_match=similar;
                best_id_match=task_iterator["id"];
    if best_match>0.6:
        for task_iterator in task_json:
            if best_id_match==task_iterator["id"]:
                if task not in task_iterator["aliases"]:
                    task_iterator["aliases"].append(task);
                    print("Added ",task," to previously made id: ",task_iterator["id"]);
                break;
        with open(FILE_PATH, "w") as f:
            json.dump(json_file, f, indent=4);
        return {
                "Task":task,
                "id":best_id_match
            };
    else:
        return exception_unknown(task);

def display(json_res):
    print("Task: ",json_res["Task"]);
    print("id: ",json_res["id"]);

def main():
    opt=1;
    while opt==1:
        task=input("Enter Task: ");
        task=task.lower().strip();
        json_result=classification(task);
        display(json_result);
        opt=int(input("Press 1 to continue: "));

if __name__=="__main__":
    main();
file.close();





## this is task_extractor_model.py