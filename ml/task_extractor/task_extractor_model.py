import spacy;
import json;
from spacy import displacy;
import numpy as np;

nlp=spacy.load("en_core_web_md");
file=open("D:\Python\task-glossary.json",'r');
json_file=json.load(file);

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
            if best_id_match==task_iterator["id"];
                

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