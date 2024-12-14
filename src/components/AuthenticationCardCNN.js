import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthenticationCardCNN = () => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [identifiedPerson, setIdentifiedPerson] = useState(null);
    const [message, setMessage] = useState("");
    const [personsIdentified, setPersonsIdentified] = useState([]);
    const videoRef = useRef(null);
    const [capturing, setCapturing] = useState(false);
    const [showRecapture, setShowRecapture] = useState(false);
    const [showReverify, setShowReverify] = useState(false);
    const navigate = useNavigate();

    // Start webcam video stream
    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (error) {
            console.error("Error accessing webcam:", error);
            setMessage("Error accessing webcam.");
            stopVideo(); // Stop the video if an error occurs
        }
    };

    // Stop webcam video stream
    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // Start authentication process
    const startAuthentication = () => {
        setCapturing(true);
        setMessage("Starting authentication...");
        setIsAuthenticating(true);
        setShowRecapture(false);
        setShowReverify(false);
        startVideo();
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
            const response = await fetch("http://localhost:5001/generate-embedding-cnn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ frame: dataUrl }),
            });

            const data = await response.json();

            if (!data.faceDetected) {
                setMessage("No face detected, please adjust your position.");
                setShowReverify(true);
                return;
            }

            const backendResponse = await fetch("http://localhost:5000/api/face/authenticate-cnn", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": sessionStorage.getItem("token"),
                },
                body: JSON.stringify({ embedding: data.embedding }),
            });

            const result = await backendResponse.json();

            if (backendResponse.ok && result.name) {
                setIdentifiedPerson(result.name);
                setMessage(`Identified: ${result.name}`);
                setPersonsIdentified((prev) => {
                    const isPersonExist = prev.some(
                        (person) => person.name === result.name && person.roll_no === result.roll_no && person.branch === result.branch && person.year === result.year && person.section === result.section
                      );
                      if (!isPersonExist) {
                        return [...prev, { name: result.name, roll_no: result.roll_no,branch:result.branch,year:result.year,section:result.section ,image: dataUrl }];
                      }
                    return prev;
                });
                stopVideo();
                setCapturing(false);
                setShowRecapture(false);
                setShowReverify(true);
            } else {
                setMessage("Face detected but not recognized.");
                setShowRecapture(true);
                stopVideo();
                setCapturing(false);
            }
        } catch (error) {
            console.error("Error during authentication:", error);
            setMessage("Error occurred during authentication.");
            stopVideo();
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

    // Stop the video stream on unmount
    useEffect(() => {
        return () => {
            stopVideo();
        };
    }, []);

    const handleRecapture = () => {
        setIdentifiedPerson(null);
        setMessage("");
        setPersonsIdentified([]);
        setShowRecapture(false);
        setShowReverify(false);
        setIsAuthenticating(false);
        startAuthentication();
    };

    const handleReverify = () => {
        setMessage("");
        setIdentifiedPerson(null);
        setPersonsIdentified([]);
        setShowRecapture(false);
        setShowReverify(false);
        setIsAuthenticating(false);
        startAuthentication();
    };

    const handleBack = () => {
        stopVideo();
        navigate("/Dashboard");
    };

    return (
        <div className="auth-container">
            <button onClick={handleBack} className="back-button">
                &lt; Back
            </button>
            <h1 className="auth-heading">Face Authentication</h1>
            <div className="auth-content">
                <div className="auth-card">
                    <div className="auth-card-body">
                        <div className="video-container">
                            <video
                                ref={videoRef}
                                width="100%"
                                height="auto"
                                autoPlay
                                muted
                                className="auth-video"
                            />
                        </div>
                        <div className="auth-buttons">
                            <button
                                onClick={startAuthentication}
                                disabled={isAuthenticating}
                                className="auth-btn auth-btn-success"
                            >
                                Start Authentication
                            </button>
                            {showRecapture && (
                                <button
                                    onClick={handleRecapture}
                                    className="auth-btn auth-btn-warning"
                                >
                                    Recapture
                                </button>
                            )}
                            {showReverify && (
                                <button
                                    onClick={handleReverify}
                                    className="auth-btn auth-btn-info"
                                >
                                    Reverify
                                </button>
                            )}
                        </div>
                        <h3 className="auth-identified-name mt-3">
                            {identifiedPerson ? `Identified: ${identifiedPerson}` : ""}
                        </h3>
                        <p className="auth-message">{message}</p>
                    </div>
                </div>
                {personsIdentified.length > 0 && (
                            <div className="identified-persons">
                            <h3 className="identified-persons-heading mt-4">Persons Identified</h3>
                            <ul className="identified-persons-list">
                                {personsIdentified.map((person, index) => (
                                <li key={index} className="identified-person-item">
                                    <div className="person-card">
                                    <img
                                        src={person.image}
                                        alt={person.name}
                                        className="identified-person-image"
                                    />
                                    <div className="person-details">
                                        <p><strong>Name:</strong> {person.name}</p>
                                        <p><strong>Roll No:</strong> {person.roll_no}</p>
                                        <p><strong>Branch:</strong> {person.branch}</p>
                                        <p><strong>Year:</strong> {person.year}</p>
                                        <p><strong>Section:</strong> {person.section}</p>
                                    </div>
                                    </div>
                                </li>
                                ))}
                            </ul>
                            </div>
                        )}
            </div>
        </div>
    );
};

export default AuthenticationCardCNN;
