
import React, { useRef, useState, useEffect } from "react";
// import './Authentication.css'; // Import your CSS file

const GroupAuthentication = () => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [identifiedPerson, setIdentifiedPerson] = useState(null);
    const [message, setMessage] = useState("");
    const [personsIdentified, setPersonsIdentified] = useState([]);
    const videoRef = useRef(null);
    const [capturing, setCapturing] = useState(false);

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

            if (!data.faceDetected) {
                setMessage("No face detected, please adjust your position.");
                return;
            }

            // If a face is detected, send the embedding to the backend for authentication
            const backendResponse = await fetch("http://localhost:5000/api/face/authenticate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token"),
                },
                body: JSON.stringify({ embedding: data.embedding }),
            });

            const result = await backendResponse.json();

            if (backendResponse.ok && result.name) {
                setIdentifiedPerson(result.name);
                setMessage(`Identified: ${result.name}`);

                // Add to the identified persons list if not already present
                setPersonsIdentified((prev) => {
                    const isPersonExist = prev.some((person) => person.name === result.name);
                    if (!isPersonExist) {
                        return [
                            ...prev,
                            { name: result.name, image: dataUrl },
                        ];
                    }
                    return prev;
                });
            } else {
                setMessage("Face detected but not recognized.");
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

    return (
        <div className="container my-5">
            <h1 className="text-center">Face Authentication</h1>
            <div className="card shadow">
                <div className="card-body">
                    <div className="text-center">
                        <video ref={videoRef} width="100%" height="auto" autoPlay muted />
                    </div>
                    <div className="d-flex justify-content-between mt-3">
                        <button onClick={startAuthentication} disabled={isAuthenticating} className="btn btn-success">
                            Start Authentication
                        </button>
                        <button onClick={stopAuthentication} disabled={!isAuthenticating} className="btn btn-danger">
                            Stop Authentication
                        </button>
                    </div>
                    <h3 className="mt-3">{identifiedPerson ? `Identified: ${identifiedPerson}` : ""}</h3>
                    <p>{message}</p>

                    {/* List of identified persons */}
                    {personsIdentified.length > 0 && (
                        <div>
                            <h3>Persons Identified</h3>
                            <ul className="list-group">
                                {personsIdentified.map((person, index) => (
                                    <li key={index} className="list-group-item d-flex align-items-center">
                                        <img
                                            src={person.image}
                                            alt={person.name}
                                            style={{ width: "50px", height: "50px", marginRight: "10px", borderRadius: "50%" }}
                                        />
                                        {person.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupAuthentication;