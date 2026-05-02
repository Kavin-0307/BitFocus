import json
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestRegressor

# load data
with open("data.json") as f:
    data = json.load(f)

texts = [d["text"] for d in data]
y = [d["estimatedPomodoros"] for d in data]

# vectorize
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

# model
model = RandomForestRegressor()
model.fit(X, y)

# save model
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("Model trained and saved successfully!")