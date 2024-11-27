from flask import Flask, request, jsonify
from keras_facenet import FaceNet
import numpy as np
import base64
import io
from PIL import Image
import cv2
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model

app = Flask(__name__)  # Fix incorrect naming convention
CORS(app)

# Explicitly define allowed origins for security (optional, but recommended)
cors_config = {
    "origins": ["http://localhost:3000"],  # Allow frontend's origin
    "methods": ["GET", "POST", "OPTIONS"],  # Allowed methods
    "allow_headers": ["Content-Type", "Authorization"]  # Allowed headers
}
CORS(app, resources={
    r"/*": cors_config  # Apply the above config to all routes
})

# Initialize FaceNet pretrained
embedder = FaceNet()

#loading custom model
custom_model = load_model('C:/Users/Anirudh/Desktop/fr/backend/face_model_74.h5')

@app.route('/generate-embedding', methods=['POST'])
def generate_embedding():
    try:
        data = request.get_json()
        frame_data = data.get("frame")

        # Decode the base64 frame
        img_bytes = base64.b64decode(frame_data.split(",")[1])
        img = Image.open(io.BytesIO(img_bytes))
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

        # Detect faces
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), 1.3, 5)

        if len(faces) == 0:
            # No face detected
            return jsonify({"faceDetected": False, "message": "No face detected"}), 200

        # Process the first detected face (adjust if you want to handle multiple faces)
        (x, y, w, h) = faces[0]
        face = frame[y:y+h, x:x+w]
        face = cv2.resize(face, (160, 160))  # Resize face to match FaceNet input
        embedding = embedder.embeddings([face])[0]

        # Return embedding
        return jsonify({"faceDetected": True, "embedding": embedding.tolist()}), 200

    except Exception as e:
        return jsonify({"error": "An error occurred while processing the frame", "details": str(e)}), 500

@app.route('/generate-embedding-cnn', methods=['POST'])
def generate_embedding_cnn():
     try:
        data = request.get_json()
        frame_data = data.get("frame")
        # Decode the base64 frame
        img_bytes = base64.b64decode(frame_data.split(",")[1])
        img = Image.open(io.BytesIO(img_bytes))
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
          # Detect faces
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), 1.3, 5)
        if len(faces) == 0:
            return jsonify({"faceDetected": False, "message": "No face detected"}), 200
        (x, y, w, h) = faces[0]
        face = frame[y:y+h, x:x+w]
        face = cv2.resize(face, (96,96))
        # Normalize face for the custom model
        face = face / 255.0
        face = np.expand_dims(face, axis=0)
        embedding = custom_model.predict(face)[0]
        
        return jsonify({"faceDetected": True, "embedding": embedding.tolist()}), 200

     except Exception as e:
        return jsonify({"error": "An error occurred while processing the frame", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5001)
