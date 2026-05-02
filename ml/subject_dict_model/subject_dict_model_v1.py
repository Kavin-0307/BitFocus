import spacy;
import json;
from spacy import displacy;
import numpy as np;
nlp=spacy.load("en_core_web_md");

file=open("D:\Python\subjects-representation.json",'r');
json_file=json.load(file);

def classification(subject):
    category=json_file["categories"];
    best_match=0.0
    best_id_match="NULL"
    for cat in category:
        if subject in cat["aliases"]:
            return {
                "Similarity": 1.0,
                "id": cat["id"],
                "subject": subject
            }
    doc_sub=nlp(subject);
    for cat in category:
        for alias in cat["aliases"]:
            doc_ali=nlp(alias);
            similar=doc_sub.similarity(doc_ali);
            if best_match<similar:
                best_match=similar;
                best_id_match=cat["id"];
    return {
        "Similarity":best_match,
        "id":best_id_match,
        "subject":subject
    };

def display(json_file):
    print("Similarity: ",json_file["Similarity"]);
    print("id: ",json_file["id"]);
    print("For Subject: ",json_file["subject"]);
    
def main():
    opt=1;
    while opt==1:
        subject=input("Enter Subject: ");
        subject=subject.lower().strip();
        json_result=classification(subject);
        display(json_result);
        opt=int(input("Press 1 to continue: "));

if __name__=="__main__":
    main();
file.close();