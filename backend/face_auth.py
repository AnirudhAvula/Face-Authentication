from flask import Flask, request, jsonify
from keras_facenet import FaceNet
import numpy as np
import base64
import io
from PIL import Image
from facenet_pytorch import MTCNN  
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
custom_model = load_model('C:/Users/VARUN/OneDrive/Desktop/Face-Authentication-main/backend/face_model_74.h5')

# Initialize MTCNN for face detection
mtcnn = MTCNN(keep_all=True)

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
        
        if len(faces) > 1:
            # Multiple faces detected
            return jsonify({
                "faceDetected": False,
                "message": "Multiple faces detected. Please adjust the camera to capture only one face."
            }), 200

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

@app.route('/generate-embedding-group', methods=['POST'])
def generate_embedding_group():
    try:
        data = request.get_json()
        frame_data = data.get("frame")

        # Decode the base64 frame
        img_bytes = base64.b64decode(frame_data.split(",")[1])
        img = Image.open(io.BytesIO(img_bytes))
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

        # Detect faces using MTCNN
        boxes, _ = mtcnn.detect(frame)
        if boxes is None or len(boxes) == 0:
            return jsonify({"faceDetected": False, "message": "No faces detected"}), 200

        face_results = []  # To store details of all detected faces

        for box in boxes:
            x1, y1, x2, y2 = map(int, box)

            # Ensure the face box is within image boundaries
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(frame.shape[1], x2), min(frame.shape[0], y2)

            face = frame[y1:y2, x1:x2]

            # Preprocess face for FaceNet
            try:
                face = cv2.resize(face, (160, 160))  # Resize to FaceNet input size
                face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)  # Convert to RGB
                embedding = embedder.embeddings([face])[0]  # Generate embedding

                # Add face embedding and coordinates to results
                face_results.append({
                    "box": [x1, y1, x2, y2],
                    "embedding": embedding.tolist()
                })
            except Exception as face_error:
                # Handle issues with individual faces (e.g., resizing errors)
                face_results.append({
                    "box": [x1, y1, x2, y2],
                    "error": f"Error processing face: {str(face_error)}"
                })

        return jsonify({"faceDetected": True, "faces": face_results}), 200

    except Exception as e:
        return jsonify({"error": "An error occurred while processing the frame", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5001)
