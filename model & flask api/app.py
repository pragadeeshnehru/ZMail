from flask import Flask, request, jsonify
import joblib
from sklearn.feature_extraction.text import CountVectorizer
import pandas as pd
from flask_cors import CORS, cross_origin
from google.oauth2 import id_token
from google.auth.transport import requests
from googleapiclient.discovery import build

app = Flask(__name__)
CORS(app)
CORS(app, resources={r'/*': {'origins': '*'}})

CLIENT_ID = "814496078084-mcgsttnj25f7uknuhvul9f8rofojf8ft.apps.googleusercontent.com"

# Load the trained logistic regression model
logistic_model = joblib.load('logistic_regression_model.pkl')
vectorizer = joblib.load('count_vectorizer.pkl')

# Define prediction endpoint


@app.route('/predict', methods=['POST'])
@cross_origin()
def predict():
    data = request.json
    text = data['text']

    # Vectorize the text data
    text_vectorized = vectorizer.transform([text])

    # Make predictions
    prediction = logistic_model.predict(text_vectorized)
    predicted_label = "Spam" if prediction[0] == 1 else "Not Spam"

    return jsonify({'prediction': predicted_label})


@app.route('/emails', methods=['GET'])
def get_emails():
    try:
        # Extract the token from the request header
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Authorization header is missing'}), 401

        # Verify and decode the token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        email = idinfo['email']

        # Initialize the Gmail API
        service = build('gmail', 'v1')

        # Fetch the user's emails
        messages = service.users().messages().list(userId='me', labelIds=['INBOX']).execute()

        # Extract email subjects
        subjects = [message['snippet'] for message in messages.get('messages', [])]

        return jsonify({'emails': subjects}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
