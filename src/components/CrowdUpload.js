import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./CrowdUpload.css";
import { useNavigate } from "react-router-dom";

const CrowdUpload = () => {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [outputVideoUrl, setOutputVideoUrl] = useState('');
    const [logs, setLogs] = useState([]);
    const navigate = useNavigate();

    // Handle file selection
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedVideo(file);
            setPreviewUrl(URL.createObjectURL(file));
            console.log("Preview URL: " + previewUrl);
        } else {
            console.log("No file selected");
        }
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedVideo) {
            alert("Please select a video before uploading.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedVideo);

        try {
            setIsLoading(true);
            setResponse(null);
            setOutputVideoUrl('');
            setLogs([]);

            const res = await axios.post('http://localhost:5002/video-detect', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { output_video, person_count_per_frame, total_person_count, average_detections } = res.data;
            setResponse({ person_count_per_frame, total_person_count, average_detections });

            console.log("Received output video: ", output_video);
            setOutputVideoUrl(`http://localhost:5002/get-output-video/${output_video}`);

        } catch (error) {
            console.error("Error uploading video:", error);
            alert("Failed to upload video. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Subscribe to logs from the server
    useEffect(() => {
        const eventSource = new EventSource('http://localhost:5002/logs');
        eventSource.onmessage = (event) => {
            setLogs((prevLogs) => [...prevLogs, event.data]);
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const handleBack = () => {
        navigate("/Dashboard"); // Navigate back to the dashboard
    };

    return (
        <div className="crowd-container">
            {/* Back Button */}
            <button onClick={handleBack} className="back-button">
                &lt; Back
            </button>
            <div className="crowd-upload-container">
                <h1 className="title">Video Crowd Detection</h1>

                <form onSubmit={handleSubmit} className="upload-form">
                    <div className="upload-section">
                        <label htmlFor="file-upload" className="file-upload-label">Choose a Video</label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="file-upload-input"
                        />
                    </div>

                    {previewUrl && (
                        <div className="preview-section">
                            <h3 className="section-title">Video Preview</h3>
                            <video controls src={previewUrl} className="video-preview" />
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="upload-button">
                        {isLoading ? 'Processing...' : 'Upload Video'}
                    </button>
                </form>

                {isLoading && (
                    <div className="loading-section">
                        <h3>Processing Video...</h3>
                    </div>
                )}

                {response && response.person_count_per_frame && (
                    <div className="response-section">
                        <h3 className="section-title">Detection Results:</h3>
                        <p>Total Persons Counted: <strong>{response.total_person_count}</strong></p>
                        <h4>Persons Per Frame:</h4>
                        <ul>
                            {response.person_count_per_frame.map((count, index) => (
                                <li key={index}>Frame {index + 1}: {count}</li>
                            ))}
                        </ul>
                    </div>
                )}

{outputVideoUrl && (
    <div className="output-video-section">
        <h3 className="section-title">Processed Video:</h3>

        {response?.average_detections !== undefined && (
    <div className="average-detections-container">
        <p>
            Average Persons Per Frame: <strong className="average-detections-value">{response.average_detections}</strong>
        </p>
    </div>
)}


        <a
            href={outputVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="video-link"
        >
            Download Video
        </a>

        <p>Video URL: {outputVideoUrl}</p>
    </div>
)}

            </div>

            <div className="logs-section">
                <h3 className="section-title">Processing Logs:</h3>
                <div className="logs">
                    {logs.length > 0 ? (
                        logs.map((log, index) => <p key={index}>{log}</p>)
                    ) : (
                        <p>No logs yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CrowdUpload;
