
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import './Authentication.css'; // Import your CSS file

const GroupAuthentication = () => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [identifiedPerson, setIdentifiedPerson] = useState(null);
    const [message, setMessage] = useState("");
    const [personsIdentified, setPersonsIdentified] = useState([]);
    const videoRef = useRef(null);
    const [capturing, setCapturing] = useState(false);
    const navigate = useNavigate(); 

    // Start webcam video stream
    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        } catch (error) {
            console.error("Error accessing webcam:", error);
            setMessage("Error accessing webcam.");
        }
    };

    // Stop webcam video stream
    const stopVideo = () => {
        const stream = videoRef.current.srcObject;
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // Start authentication process
    const startAuthentication = () => {
        setCapturing(true);
        setMessage("Starting authentication...");
        setIsAuthenticating(true);
        startVideo();
    };

    // Stop authentication process
    const stopAuthentication = () => {
        setIsAuthenticating(false);
        setMessage("Authentication stopped.");
        setCapturing(false);
        stopVideo();
    };

    // Capture a frame and send it to the Flask server
    const captureFrame = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
    
        try {
            // Send the frame to Flask for face detection and embedding generation
            const response = await fetch("http://localhost:5001/generate-embedding-group", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ frame: dataUrl }),
            });
    
            const data = await response.json();
    
            if (!data.faceDetected || data.faces.length === 0) {
                setMessage("No face detected, please adjust your position.");
                return;
            }
    
            // Extract embeddings from Flask response
            const embeddings = data.faces.map((face) => face.embedding);
    
            // Send all embeddings to the backend for authentication
            const backendResponse = await fetch("http://localhost:5000/api/face/groupauthenticate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": sessionStorage.getItem("token"),
                },
                body: JSON.stringify({ embeddings }),
            });
    
            const result = await backendResponse.json();
    
            if (backendResponse.ok) {
                const identifiedPersons = result.results.filter((r) => r.match);
                if (identifiedPersons.length > 0) {
                    identifiedPersons.forEach((person) => {
                        setPersonsIdentified((prev) => {
                            const isPersonExist = prev.some((p) => p.name === person.name);
                            if (!isPersonExist) {
                                const storeVerificationResponse =  fetch(
                                    "http://localhost:5000/api/face/store-verification",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                        "auth-token": sessionStorage.getItem("token"), // Ensure the token is correctly set
                                      },
                                      body: JSON.stringify({ labelName: person.name }), // Ensure result.name has the expected value
                                    }
                                  );
                                return [
                                    ...prev,
                                    { name: person.name, image: dataUrl },
                                ];
                            }
                            return prev;
                        });
                    });
                    setMessage(`Identified: ${identifiedPersons.map((p) => p.name).join(", ")}`);
                } else {
                    setMessage("Faces detected but not recognized.");
                }

                
            } else {
                setMessage("Error in authentication.");
            }
        } catch (error) {
            console.error("Error during authentication:", error);
            setMessage("Error occurred during authentication.");
        }
    };
    

    // Continuously capture frames while "capturing" is true
    useEffect(() => {
        let interval;
        if (capturing) {
            interval = setInterval(() => {
                captureFrame();
            }, 1000);
        }
        return () => clearInterval(interval); // Cleanup on unmount
    }, [capturing]);
    const handleBack = () => {
        stopVideo();
        navigate("/Dashboard");
    };

    return (
        <div className="auth-container">
            <button onClick={handleBack} className="back-button">
                &lt; Back
            </button>
    <h1 className="auth-heading">Group Authentication Mtcnn</h1>
    <div className="auth-content">
        <div className="auth-card">
            <div className="auth-card-body">
                <div className="video-container">
                    <video ref={videoRef} className="auth-video" autoPlay muted />
                </div>
                <div className="auth-buttons">
                    <button 
                        onClick={startAuthentication} 
                        disabled={isAuthenticating} 
                        className="auth-btn auth-btn-success"
                    >
                        Start Authentication
                    </button>
                    <button 
                        onClick={stopAuthentication} 
                        disabled={!isAuthenticating} 
                        className="auth-btn auth-btn-danger"
                    >
                        Stop Authentication
                    </button>
                </div>
                <h3 className="auth-identified-name">
                    {identifiedPerson ? `Identified: ${identifiedPerson}` : ""}
                </h3>
                <p className="auth-message">{message}</p>
            </div>
        </div>
        
        {/* Identified Persons Section */}
        {personsIdentified.length > 0 && (
            <div className="identified-persons">
                <h3 className="identified-persons-heading">Persons Identified</h3>
                <ul className="identified-persons-list">
                    {personsIdentified.map((person, index) => (
                        <li key={index} className="identified-person-item">
                            <img
                                src={person.image}
                                alt={person.name}
                                className="identified-person-image"
                            />
                            {person.name}
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
</div>

    );
};

export default GroupAuthentication;