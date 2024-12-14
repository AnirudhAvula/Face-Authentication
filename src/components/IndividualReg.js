import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './IndividualReg.css';

const IndividualReg = () => {
    const videoRef = useRef(null);
    const navigate = useNavigate(); // Initialize navigate hook
    const [isRegistering, setIsRegistering] = useState(false);
    const  [capturedFrames,setCapturedFrames] = useState([]);
    const [frameCount, setFrameCount] = useState(0);
    const [status, setStatus] = useState("");
    const [name, setName] = useState("");
    const [roll_no, setroll_no] = useState("");
    const [branch, setbranch] = useState("");
    const [year, setyear] = useState("");
    const [section, setsection] = useState("");

    // Start the video stream
    const startVideo = async () => {
        if (videoRef.current && videoRef.current.srcObject) {
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
        } catch (error) {
            console.error("Error accessing webcam:", error);
            setStatus("Unable to access the camera. Please allow permissions.");
        }
    };

    // Stop the video stream
    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // Capture a single frame from the video
    const captureFrame = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg");
        return dataUrl; // Base64 representation of the captured frame
    };

    // Handle registration process
    const handleRegister = async () => {
        if (!name) {
            alert("Please enter a name");
            return;
        }

        setIsRegistering(true);
        setCapturedFrames([]); 
        setStatus("Starting registration...");
        setFrameCount(0);

        let embeddings = [];
        let frameCounter = 0;

        const captureInterval = setInterval(async () => {
            if (frameCounter < 10) {
                const frame = await captureFrame();  // Call captureFrame instead of captureFrames
                if (frame) {
                    try {
                        const response = await fetch("http://localhost:5001/generate-embedding", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ frame }),
                        });

                        const data = await response.json();

                        if (data.faceDetected) {
                            embeddings.push(data.embedding); 
                            setFrameCount((prev) => prev + 1);
                            setStatus(`Face detected and captured (${frameCounter + 1}/10).`);
                            frameCounter++;
                        } else {
                            setStatus("No face detected, please adjust your position.");
                        }
                    } catch (error) {
                        console.error("Error communicating with Flask backend:", error);
                        setStatus("Error processing frame.");
                    }
                }
            } else {
                clearInterval(captureInterval);
                stopVideo();
                sendEmbeddingsToBackend(embeddings);
            }
        }, 1000); // Capture frames every second
    };

    // Send captured embeddings to the Node.js backend
    const sendEmbeddingsToBackend = async (embeddings) => {
        if (embeddings.length === 0) {
            setStatus("No valid embeddings captured.");
            return;
        }

        const requestBody = { name,roll_no,branch,year,section, embeddings };
        console.log("Sending request with body:", requestBody);

        try {
            const response = await fetch("http://localhost:5000/api/face/register-face", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": sessionStorage.getItem("token"),
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                setStatus("Registration complete.");
            } else {
                const errorData = await response.json();
                console.log("Backend response:", errorData);
                setStatus(`Error registering face: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error sending embeddings:", error);
            setStatus("Error occurred during registration.");
        } finally {
            setIsRegistering(false);
        }
    };

    // Stop the video when the component is unmounted
    useEffect(() => {
        return () => {
            stopVideo();
        };
    }, []);

    // Back button handler
    const handleBack = () => {
        navigate("/Dashboard"); // Navigate back to the dashboard
    };

    return (
        <div className="register-container">
            <button onClick={handleBack} className="back-button">
                &lt; Back
            </button>
            <h1 className="register-heading">Register Face</h1>
            <div className="register-card">
                <div className="register-card-body">
                    <input
                        type="text"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isRegistering}
                        className="register-input mb-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Enter Roll_no"
                        value={roll_no}
                        onChange={(e) => setroll_no(e.target.value)}
                        disabled={isRegistering}
                        className="register-input mb-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Enter Branch"
                        value={branch}
                        onChange={(e) => setbranch(e.target.value)}
                        disabled={isRegistering}
                        className="register-input mb-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Enter year"
                        value={year}
                        onChange={(e) => setyear(e.target.value)}
                        disabled={isRegistering}
                        className="register-input mb-3"
                        required
                    />
                    
                    <input
                        type="text"
                        placeholder="Enter section"
                        value={section}
                        onChange={(e) => setsection(e.target.value)}
                        disabled={isRegistering}
                        className="register-input mb-3"
                        required
                    />
                    <video ref={videoRef} className="register-video" muted />
                    <br />
                    <div className="register-buttons mt-3">
                        <button onClick={startVideo} disabled={isRegistering} className="register-btn register-btn-success">
                            Start Camera
                        </button>
                        <button onClick={stopVideo} disabled={isRegistering} className="register-btn register-btn-danger">
                            Stop Camera
                        </button>
                    </div>
                    <button onClick={handleRegister} disabled={isRegistering} className="register-btn register-btn-primary mt-3">
                        Register
                    </button>
                    <p className="register-status mt-3">Status: {status}</p>
                    <p className="register-frame-count">Captured Frames: {frameCount}/10</p>
                </div>
            </div>
        </div>
    );
};

export default IndividualReg;
