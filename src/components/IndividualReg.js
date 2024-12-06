import React, { useRef, useState, useEffect } from "react";

const IndividualReg = () => {
    const videoRef = useRef(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [capturedFrames, setCapturedFrames] = useState([]);
    const [frameCount, setFrameCount] = useState(0);
    const [status, setStatus] = useState("");
    const [name, setName] = useState("");
    const [rollno, setRollno] = useState("");
    const [year, setYear] = useState("");
    const [branch, setBranch] = useState("");
    const [section, setSection] = useState("");

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
        }else if (!rollno) {
            alert("Please enter a roll number");
            return;
        }else if (!branch) {
            alert("Please enter your Branch!");
            return;
        } else if(!section){
            alert("Please Enter your Section!!")
        } else if(!year){
            alert("Please Enter your year!!")
        }

        setIsRegistering(true);
        setCapturedFrames([]); 
        setStatus("Starting registration...");
        setFrameCount(0);

        let embeddings = [];
        let frameCounter = 0;

        const captureInterval = setInterval(async () => {
            if (frameCounter < 10) {
                const frame = await captureFrame();
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
        }, 1000); 
    };

    // Send captured embeddings to the Node.js backend
    const sendEmbeddingsToBackend = async (embeddings) => {
        if (embeddings.length === 0) {
            setStatus("No valid embeddings captured.");
            return;
        }

        const requestBody = { name,rollno,year,branch,section, embeddings };
        console.log("Sending request with body:", requestBody);

        try {
            const response = await fetch("http://localhost:5000/api/face/register-face", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token"),
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

    return (
        <div className="container my-5">
            <h1 className="text-center">Register Face</h1>
            <div className="card">
                <div className="card-body">
                    <input
                        type="text"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isRegistering}
                        className="form-control mb-3"
                    />
                    <input
                        type="text"
                        placeholder="Enter Roll Number:"
                        value={rollno}
                        onChange={(e) => setRollno(e.target.value)}
                        disabled={isRegistering}
                        className="form-control mb-3"
                    />
                    <input
                        type="text"
                        placeholder="Enter Year:"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        disabled={isRegistering}
                        className="form-control mb-3"
                    />
                    <input
                        type="text"
                        placeholder="Enter your Branch:"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        disabled={isRegistering}
                        className="form-control mb-3"
                    />
                    <input
                        type="text"
                        placeholder="Enter your Section:"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        disabled={isRegistering}
                        className="form-control mb-3"
                    />
                    <video ref={videoRef} style={{ width: "100%", height: "auto" }} muted />
                    <br />
                    <div className="d-flex justify-content-between mt-3">
                        <button onClick={startVideo} disabled={isRegistering} className="btn btn-success">
                            Start Camera
                        </button>
                        <button onClick={stopVideo} disabled={isRegistering} className="btn btn-danger">
                            Stop Camera
                        </button>
                    </div>
                    <button onClick={handleRegister} disabled={isRegistering} className="btn btn-primary mt-3">
                        Register
                    </button>
                    <p className="mt-3">Status: {status}</p>
                    <p>Captured Frames: {frameCount}/10</p>
                </div>
            </div>
        </div>
    );
};

export default IndividualReg;