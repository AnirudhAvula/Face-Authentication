import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import "./AuthenticationCard.css";

const Authentication = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [identifiedPerson, setIdentifiedPerson] = useState(null);
  const [message, setMessage] = useState("");
  const [personsIdentified, setPersonsIdentified] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [showRecapture, setShowRecapture] = useState(false); // New state for recapture button
  const [showReverify, setShowReverify] = useState(false); // New state for reverify button

  const videoRef = useRef(null);
  const navigate = useNavigate(); // Hook to navigate

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
    const stream = videoRef.current?.srcObject;
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
    setShowRecapture(false); // Hide recapture button when authentication starts
    setShowReverify(false); // Hide reverify button when authentication starts
    startVideo();
  };

  // Capture a frame and send it to the Flask server
  const captureFrame = useCallback(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current?.videoWidth || 0;
    canvas.height = videoRef.current?.videoHeight || 0;
    const context = canvas.getContext("2d");
    context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");

    try {
      // Send the frame to Flask for face detection and embedding generation
      const response = await fetch("http://localhost:5001/generate-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: dataUrl }),
      });

      const data = await response.json();

      if (!data.faceDetected) {
        // Check if the response message indicates multiple faces detected
        if (data.message === "Multiple faces detected. Please adjust the camera to capture only one face.") {
          setMessage(data.message); // Set the message to show the user
        }
        setShowRecapture(true); // Show recapture button if no face detected or multiple faces detected
        return;
      }

      // If a face is detected, send the embedding to the backend for authentication
      const backendResponse = await fetch(
        "http://localhost:5000/api/face/authenticate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify({ embedding: data.embedding }),
        }
      );

      const result = await backendResponse.json();

      if (backendResponse.ok && result.name) {
        setIdentifiedPerson(result.name);
        setMessage(`Name: ${result.name}`);
        console.log("Result Name:", result.name); // Check if it's the expected value

        const storeVerificationResponse = await fetch(
          "http://localhost:5000/api/face/store-verification",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": sessionStorage.getItem("token"), // Ensure the token is correctly set
            },
            body: JSON.stringify({ labelName: result.name }), // Ensure result.name has the expected value
          }
        );
        
        

        // Add to the identified persons list if not already present
        setPersonsIdentified((prev) => {
          const isPersonExist = prev.some(
            (person) =>
              person.name === result.name &&
              person.roll_no === result.roll_no &&
              person.branch === result.branch &&
              person.year === result.year &&
              person.section === result.section
          );
          if (!isPersonExist) {
            return [
              ...prev,
              {
                name: result.name,
                roll_no: result.roll_no,
                branch: result.branch,
                year: result.year,
                section: result.section,
                image: dataUrl,
              },
            ];
          }
          return prev;
        });

        // Stop the webcam after a person is identified
        stopVideo();
        setCapturing(false);
        setShowRecapture(false);
        setShowReverify(true);
      } else {
        setMessage("Authentication failed: Unknown user detected");
        setShowRecapture(true); // Show recapture button if face is detected but not recognized
        stopVideo(); // Stop the video if the face is not recognized
        setCapturing(false);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setMessage("Error occurred during authentication.");
      setShowRecapture(false);
      stopVideo(); // Stop the video on any error
    }
  }, []); // Empty array means this function won't change unless dependencies change

  // Continuously capture frames while "capturing" is true
  useEffect(() => {
    let interval;
    if (capturing) {
      interval = setInterval(() => {
        captureFrame();
      }, 1000);
    }
    return () => clearInterval(interval); // Cleanup on unmount
  }, [capturing, captureFrame]);

  // Stop the video when the component unmounts or the user navigates away
  useEffect(() => {
    return () => {
      stopVideo(); // Cleanup on unmount
    };
  }, []);

  // Reset states for recapture and reverify
  const handleRecapture = () => {
    setIdentifiedPerson(null);
    setMessage("");
    setPersonsIdentified([]);
    setShowRecapture(false);
    setShowReverify(false);
    setIsAuthenticating(false);
    startAuthentication();
  };

  // Handle reverify process
  const handleReverify = () => {
    setMessage("");
    setIdentifiedPerson(null);
    setPersonsIdentified([]);
    setShowRecapture(false);
    setShowReverify(false);
    setIsAuthenticating(false);
    startAuthentication();
  };

  // Handle Back Button Click
  const handleBack = () => {
    stopVideo(); // Ensure video stops when navigating back
    navigate("/Dashboard"); // Navigate back to the dashboard
  };

  return (
    <div className="auth-container">
      {/* Back Button */}
      <button onClick={handleBack} className="back-button">
        &lt; Back
      </button>

      <h1 className="auth-heading">Face Authentication</h1>

      <div className="auth-content">
        {/* Authentication Card */}
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

        {/* Identified Persons Section */}
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

export default Authentication;
