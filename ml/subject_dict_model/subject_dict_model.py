import spacy;
import json;
from spacy import displacy;
import numpy as np;
nlp=spacy.load("en_core_web_md");

file=open("D:\Python\subjects-representation.json",'r');
json_file=json.load(file);

def exception_unknown(subject):
    print("There seems to be a problem....");
    print("The given subject does not accurately maps to any of the defined disciplines in the local database.");
    discip=input("Input the discipline of the given subject: ").lower().strip();
    doc_dis=nlp(discip);
    category=json_file["categories"];
    best_match=0.0;
    best_id_match="NULL";
    for cat in category:
        doc_json=nlp(cat["representation"]);
        simil=doc_dis.similarity(doc_json);
        if simil>best_match:
            best_match=simil;
            best_id_match=cat["id"];
    if best_match>=0.7:
        #append in best_id_match discipline here
        #print("Work In Progress...");
        for cat in category:
            if cat["id"]==best_id_match:
                if subject not in cat["aliases"]:
                    cat["aliases"].append(subject);
                    print("Added ",subject," to previously made discipline: ",cat["id"]);
                break;
    else:
        #append new discipline here
        #print("Work In Progress...");
        new_id=discip.lower().strip().replace(' ', '_')
        best_id_match=new_id;
        json_file["categories"].append({
            "id":new_id,
            "name":discip,
            "representation":discip,
            "aliases":[subject]
        });
        print("Added new discipline: ",discip);
        print("Appeneded new subject: ",subject);
        best_match=1.0
    #Saving the json locally 
    with open("D:/Python/subjects-representation.json", "w") as f:
        json.dump(json_file, f, indent=4)
    return {
        "Similarity":best_match,
        "id":best_id_match,
        "subject":subject
    };

    


def classification(subject):
    category=json_file["categories"];
    best_match=0.0
    best_id_match="NULL"

    
    for cat in category:
        if subject in cat["aliases"]:
            return {
                "Similarity":1.0,
                "id":cat["id"],
                "subject":subject
            }
        

    doc_sub=nlp(subject);
    for cat in category:
        for alias in cat["aliases"]:
            doc_ali=nlp(alias);
            similar=doc_sub.similarity(doc_ali);
            if best_match<similar:
                best_match=similar;
                best_id_match=cat["id"];
    

    if best_match>0.6:
        for cat in category:
            if best_id_match==cat["id"]:
                if subject not in cat["aliases"]:
                    cat["aliases"].append(subject);
                    print("Added ",subject," to previously made discipline: ",cat["id"]);
        
        return {
            "Similarity":best_match,
            "id":best_id_match,
            "subject":subject
        };
    else:
        return exception_unknown(subject);

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