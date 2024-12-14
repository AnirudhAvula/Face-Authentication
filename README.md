# Face Authentication System

This project is a **Face Authentication System** designed for secure user authentication, individual face registration, group verification, and crowd analysis. It leverages **deep learning** and **computer vision** techniques within a **MERN stack** architecture for efficient and scalable performance.

---

## Features

1. **User Authentication**:
   - Secure signup and login system with JWT-based authentication.
   - Each user can manage their personal database of face embeddings.

2. **Individual Face Registration**:
   - Capture face images and generate embeddings using a Python microservice.
   - Store embeddings in MongoDB associated with the logged-in user.

3. **Face Authentication**:
   - Real-time identification and authentication of registered faces.
   - Display identified person's name and other details.

4. **Group Verification**:
   - Authenticate multiple individuals at once.
   - Export identified persons' details (e.g., roll number, class, section, year) to an Excel file.

5. **Crowd Analysis**:
   - Detect and count faces in large gatherings using YOLO for detection.
  
6.  **User Authentication History**:
   - User can check the details of people who got authenticated and the time of their authentication.

---

## Architecture

### Backend
- **Node.js**:
  - Handles user authentication, database management, and communication with the frontend.
  - Implements RESTful APIs for registration, authentication, and crowd analysis.
- **MongoDB**:
  - Stores user data and face embeddings.
- **Middleware**:
  - JWT-based middleware to secure routes and verify user identity.

### Python Microservice
- **Flask**:
  - Processes images for face detection and generates embeddings.
  - Communicates with the frontend for real-time feedback.
- **Deep Learning**:
  - Uses Haar cascades, YOLO, and other models for face detection and embedding generation.

### Frontend
- **React.js**:
  - User-friendly interface for registration, authentication, and crowd analysis.
  - Real-time display of identified faces and details.

---

## Installation and Setup

### Prerequisites
- Node.js
- MongoDB
- Python (with Flask and required libraries)
- React.js

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/face-authentication.git
   cd face-authentication
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   node index.js
   ```

3. **Setup Python Microservice**:
```bash
  cd backend
  python face_auth.py
```
Install all the required modules

   ```bash
   cd yolo
   pip install -r requirements.txt
   python app.py
   ```

---

## Usage

1. **Register a User**:
   - Signup with email and password.

2. **Add Faces**:
   - Register individual faces with names.

3. **Authenticate Faces**:
   - Authenticate registered faces in real-time.

4. **Group Verification**:
   - Verify multiple individuals and export their details.

5. **Crowd Analysis**:
   - Detect and count faces in a crowd.

---

## Technologies Used

- **Frontend**: React.js, CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Python Microservice**: Flask, OpenCV, NumPy
- **Deep Learning**: Haar cascades, YOLO, MTCNN

---


