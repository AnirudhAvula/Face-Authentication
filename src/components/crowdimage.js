import React, { useState } from 'react';
import axios from 'axios';
import "./crowdimage.css"
import { useNavigate } from "react-router-dom";

const CrowdImage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [outputUrl, setOutputUrl] = useState('');

    const navigate = useNavigate(); 
    // Handle file selection
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate if the selected file is an image
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.');
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            alert('Please select a file before uploading.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setIsLoading(true);
            const endpoint = 'http://localhost:5002/detect';
            const res = await axios.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResponse(res.data);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload the image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch and display output
    const showOutput = async () => {
        try {
            const endpoint = 'http://localhost:5002/get-output-image';
            const res = await axios.get(endpoint, {
                responseType: 'blob', // Ensure the response is a blob
            });

            // Create a URL for the output blob
            const outputUrl = URL.createObjectURL(res.data);
            setOutputUrl(outputUrl);
        } catch (error) {
            console.error('Error fetching output image:', error);
        }
    };
    const handleBack = () => {
        navigate("/Dashboard"); // Navigate back to the dashboard
      };

    return (
        <div className="detection-wrapper">
            {/* Back Button */}
      <button onClick={handleBack} className="back-button">
        &lt; Back
      </button>
    <div className="detection-container">
        <h1 className="detection-header">Crowd Detection</h1>

        <form onSubmit={handleSubmit} className="detection-form">
            <div className="file-upload-section">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                />
            </div>

            {previewUrl && (
                <div className="image-preview">
                    <h3 className="preview-title">Preview:</h3>
                    <img src={previewUrl} alt="Preview" className="preview-image" />
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className={`upload-button ${isLoading ? 'button-disabled' : ''}`}
            >
                {isLoading ? 'Uploading image...' : 'Upload image'}
            </button>
        </form>
    </div>

    {response && (
        <div className="detection-results">
            <h3 className="results-title">Detection Results:</h3>
            <p className="results-text">Number of Detections: {response.detections}</p>
            <button onClick={showOutput} className="output-button">
                Show Output
            </button>
            {outputUrl && (
                <div className="output-preview">
                    <h4 className="output-title">Output Preview:</h4>
                    <img
                        src={outputUrl}
                        alt="Detection Result"
                        className="output-image"
                    />
                </div>
            )}
        </div>
    )}
</div>


    );
};

export default CrowdImage;
