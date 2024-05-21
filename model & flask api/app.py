from flask import Flask, request, jsonify
import joblib
from sklearn.feature_extraction.text import CountVectorizer
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

CLIENT_ID = "814496078084-mcgsttnj25f7uknuhvul9f8rofojf8ft.apps.googleusercontent.com"
API_NAME = 'gmail'
API_VERSION = 'v1'
# Load the trained logistic regression model
logistic_model = joblib.load('logistic_regression_model.pkl')
vectorizer = joblib.load('count_vectorizer.pkl')

# Define prediction endpoint
def get_gmail_service(token):
    creds = Credentials(token=token)
    service = build(API_NAME, API_VERSION, credentials=creds)
    return service

@app.route('/predict', methods=['POST'])
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
    auth_header = request.headers.get('Authorization')
    if auth_header:
        token = auth_header.split(" ")[1]
        service = get_gmail_service(token)

        try:
            results = service.users().messages().list(userId='me', maxResults=10).execute()
            messages = results.get('messages', [])

            emails = []
            for msg in messages:
                msg_data = service.users().messages().get(userId='me', id=msg['id']).execute()
                email = {
                    'id': msg_data['id'],
                    'snippet': msg_data['snippet']
                    # You can add more email data fields as needed
                }
                emails.append(email)

            return jsonify({'emails': emails}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Authorization header is missing'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
