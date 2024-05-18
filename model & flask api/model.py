import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from tensorflow import keras
from keras.models import Sequential
from keras.layers import Dense, Dropout
import joblib

# Load the dataset
df = pd.read_csv('mail_data.csv')

# Assuming your dataset has columns 'text' for email text and 'label' for spam or not spam
X = df['text']
y = df['label']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Feature extraction
vectorizer = CountVectorizer()
X_train_vectorized = vectorizer.fit_transform(X_train)
X_test_vectorized = vectorizer.transform(X_test)

# Train the logistic regression model
logistic_model = LogisticRegression()
logistic_model.fit(X_train_vectorized, y_train)

joblib.dump(logistic_model, 'logistic_regression_model.pkl')
joblib.dump(vectorizer, 'count_vectorizer.pkl')
