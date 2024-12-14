const express = require('express')
const router = express.Router()
const axios = require('axios');
const FaceEmbedding = require('../models/FaceSchema');
const FaceEmbeddingCNN = require('../models/FaceSchemaCNN');
const fetchuser = require('../middleware/fetchuser');
const VerificationData = require('../models/VerificationData');


// Register Face - Calls Python service to generate embedding, then saves it in MongoDB


router.post('/register-face', fetchuser, async (req, res) => {
    try {
        console.log(req.body);
        const { name, roll_no, branch, year, section, embeddings } = req.body;

        // Ensure that name and embeddings are provided
        if (!name || !embeddings) {
            return res.status(400).json({ error: "Name and embedding are required" });
        }

        // Ensure embeddings is a 2D array
        if (!Array.isArray(embeddings) || !embeddings.every(Array.isArray)) {
            return res.status(400).json({ error: "Embeddings must be a 2D array" });
        }

        // Check if the roll_no already exists in the database
        const existingUser = await FaceEmbedding.findOne({ roll_no });
        if (existingUser) {
            return res.status(400).json({ error: "A user with this roll number is already registered" });
        }

        // Calculate the average embedding
        const numEmbeddings = embeddings.length;
        console.log("Number of embeddings received: ", numEmbeddings);
        const numDimensions = embeddings[0].length; // Assuming all embeddings have the same length
        console.log("Number of Dimensions: ", numDimensions);

        // Initialize an array to hold the sum of each dimension
        const sumEmbeddings = new Array(numDimensions).fill(0);
        for (const embedding of embeddings) {
            for (let i = 0; i < numDimensions; i++) {
                sumEmbeddings[i] += embedding[i];
            }
        }

        // Calculate the averaged embedding
        const averagedEmbedding = sumEmbeddings.map(value => value / numEmbeddings);

        // Create a new FaceEmbedding document with the averaged embedding
        const newFace = new FaceEmbedding({
            user: req.user.id, // Link embedding to logged-in user
            name,
            roll_no,
            branch,
            year,
            section,
            embedding: averagedEmbedding, // Store the averaged embedding
        });

        console.log(averagedEmbedding);

        // Save the new face embedding to the database
        await newFace.save();
        res.status(200).json({ message: "Face registered successfully!" });
    } catch (error) {
        console.error("Error storing embedding:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/register-face-cnn', fetchuser, async (req, res) => {
    try {
        console.log(req.body);
        const { name, roll_no, branch, year, section, embeddings } = req.body;

        // Ensure that name and embeddings are provided
        if (!name || !embeddings) {
            return res.status(400).json({ error: "Name and embedding are required" });
        }

        // Ensure embeddings is a 2D array
        if (!Array.isArray(embeddings) || !embeddings.every(Array.isArray)) {
            return res.status(400).json({ error: "Embeddings must be a 2D array" });
        }

        // Check if the roll_no already exists in the FaceEmbeddingCNN collection
        const existingUser = await FaceEmbeddingCNN.findOne({ roll_no });
        if (existingUser) {
            return res.status(400).json({ error: "A user with this roll number is already registered" });
        }

        // Calculate the average of the embeddings
        const numEmbeddings = embeddings.length;
        console.log("Number of embeddings received: ", numEmbeddings);
        const numDimensions = embeddings[0].length; // Assuming all embeddings have the same length
        console.log("Number of Dimensions: ", numDimensions);

        // Initialize an array to hold the sum of each dimension
        const sumEmbeddings = new Array(numDimensions).fill(0);
        for (const embedding of embeddings) {
            for (let i = 0; i < numDimensions; i++) {
                sumEmbeddings[i] += embedding[i];
            }
        }

        // Calculate the averaged embedding
        const averagedEmbedding = sumEmbeddings.map(value => value / numEmbeddings);

        // Create a new FaceEmbeddingCNN document with the averaged embedding
        const newFace = new FaceEmbeddingCNN({
            user: req.user.id, // Link embedding to logged-in user
            name,
            roll_no,
            branch,
            year,
            section,
            embedding: averagedEmbedding, // Store the averaged embedding
        });

        console.log(averagedEmbedding);

        // Save the new face embedding to the database
        await newFace.save();
        res.status(200).json({ message: "Face registered successfully!" });
    } catch (error) {
        console.error("Error storing embedding:", error.message);
        res.status(500).send("Internal Server Error");
    }
});


router.post('/authenticate', fetchuser, async (req, res) => {
    try {
        const { embedding } = req.body; // Receiving embedding from frontend
        console.log("Received embedding from Frontend");
        console.log("Received Embedding:", embedding);

        if (!embedding || embedding.length === 0) {
            return res.status(400).json({ error: "Embedding is required for authentication" });
        }

        // Step 1: Fetch all stored embeddings for the logged-in user
        const storedFaces = await FaceEmbedding.find({ user: req.user.id });

        if (storedFaces.length === 0) {
            return res.status(404).json({ message: "No registered faces found for authentication" });
        }

        // Step 2: Compare the received embedding with stored embeddings
        let bestMatch = null;
        let minDistance = Infinity;

        for (const face of storedFaces) {
            const storedEmbedding = face.embedding;
        
            if (embedding.length !== storedEmbedding.length) {
                console.error(`Mismatched lengths: received=${embedding.length}, stored=${storedEmbedding.length}`);
                continue; // Skip this face
            }
        
            // Calculate distance only if lengths match
            const distance = Math.sqrt(
                embedding.reduce((sum, value, idx) => sum + Math.pow(value - storedEmbedding[idx], 2), 0)
            );
            console.log(`Distance to ${face.name}: ${distance}`);
        
        
            
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = face;
            }
        }
        

        // Step 3: Decide match threshold (adjust this based on testing)
        const threshold = 0.75; // Set an appropriate threshold based on your model's performance
        if (minDistance <= threshold && bestMatch) {
            return res.status(200).json({
                message: "Person identified successfully",
                name: bestMatch.name,
                roll_no: bestMatch.roll_no,
                branch: bestMatch.branch,
                year: bestMatch.year,
                section: bestMatch.section,
                details: bestMatch, // Include any other stored details
            });
        } else {
            return res.status(200).json({ message: "No match found" });
        }
    } catch (error) {
        console.error("Error during authentication:", error.message);
        res.status(500).send("Internal Server Error");
    }
});
router.post('/groupauthenticate', fetchuser, async (req, res) => {
    try {
        const { embeddings } = req.body; // Accept multiple embeddings
        console.log("Received embeddings from Frontend");
        console.log("Number of embeddings received:", embeddings.length);

        if (!embeddings || embeddings.length === 0) {
            return res.status(400).json({ error: "Embeddings are required for authentication" });
        }

        // Fetch all stored embeddings for the logged-in user
        const storedFaces = await FaceEmbedding.find({ user: req.user.id });

        if (storedFaces.length === 0) {
            return res.status(404).json({ message: "No registered faces found for authentication" });
        }

        const threshold = 0.75; // Match threshold
        const results = []; // To store results for all embeddings

        embeddings.forEach((embedding) => {
            let bestMatch = null;
            let minDistance = Infinity;

            storedFaces.forEach((face) => {
                const storedEmbedding = face.embedding;

                if (embedding.length !== storedEmbedding.length) {
                    console.error(`Mismatched lengths: received=${embedding.length}, stored=${storedEmbedding.length}`);
                    return; // Skip this face
                }

                const distance = Math.sqrt(
                    embedding.reduce((sum, value, idx) => sum + Math.pow(value - storedEmbedding[idx], 2), 0)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    bestMatch = face;
                }
            });

            if (minDistance <= threshold && bestMatch) {
                results.push({
                    match: true,
                    name: bestMatch.name,
                    roll_no: bestMatch.roll_no,
                    branch: bestMatch.branch,
                    year: bestMatch.year,
                    section: bestMatch.section,
                });
            } else {
                results.push({ match: false, message: "No match found" });
            }
        });

        return res.status(200).json({ results });
    } catch (error) {
        console.error("Error during authentication:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/authenticate-cnn', fetchuser, async (req, res) => {
    try {
        const { embedding } = req.body; // Receiving embedding from frontend
        console.log("Received embedding from Frontend");
        console.log("Received Embedding:", embedding);

        if (!embedding || embedding.length === 0) {
            return res.status(400).json({ error: "Embedding is required for authentication" });
        }

        // Step 1: Fetch all stored embeddings for the logged-in user
        const storedFaces = await FaceEmbeddingCNN.find({ user: req.user.id });

        if (storedFaces.length === 0) {
            return res.status(404).json({ message: "No registered faces found for authentication" });
        }

        // Step 2: Compare the received embedding with stored embeddings
        let bestMatch = null;
        let minDistance = Infinity;

        for (const face of storedFaces) {
            const storedEmbedding = face.embedding;
        
            if (embedding.length !== storedEmbedding.length) {
                console.error(`Mismatched lengths: received=${embedding.length}, stored=${storedEmbedding.length}`);
                continue; // Skip this face
            }
        
            // Calculate distance only if lengths match
            const distance = Math.sqrt(
                embedding.reduce((sum, value, idx) => sum + Math.pow(value - storedEmbedding[idx], 2), 0)
            );
            console.log(`Distance to ${face.name}: ${distance}`);
        
        
            
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = face;
            }
        }
        

        // Step 3: Decide match threshold (adjust this based on testing)
        const threshold = 0.75; // Set an appropriate threshold based on your model's performance
        if (minDistance <= threshold && bestMatch) {
            return res.status(200).json({
                message: "Person identified successfully",
                name: bestMatch.name,
                roll_no: bestMatch.roll_no,
                branch: bestMatch.branch,
                year: bestMatch.year,
                section: bestMatch.section,
                details: bestMatch, // Include any other stored details
            });
        } else {
            return res.status(200).json({ message: "No match found" });
        }
    } catch (error) {
        console.error("Error during authentication:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

router.delete('/delete-labels/:label', fetchuser, async (req, res) => {
    try {
        const name = req.params.label;
        const modelType = req.query['model-type'];
        console.log('DELETE request received for label:', name, 'ModelType: ', modelType);

        if (!name || !modelType) {
            return res.status(400).json({ error: 'Label & ModelType parameters are required' });
        }

        if(modelType==='CNN') {
            result = await FaceEmbedding.deleteOne({ user: req.user.id, name });
        } else if (modelType==='PTM') {
            result = await FaceEmbeddingCNN.deleteOne({ user: req.user.id, name });
        } else {
            return res.status(400).json({ error: 'Invalid Model Type'});
        }
        
        console.log('Delete operation result:', result);

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Label not found or already deleted' });
        }

        res.json({ message: 'Label removed successfully' });
    } catch (error) {
        console.error('Error deleting label:', error.message);
        res.status(500).json({ error: 'An internal server error occurred while deleting the label' });
    }
});

router.post('/store-verification', fetchuser, async (req, res) => {
    try {
        const { labelName } = req.body;

        if (!labelName) {
            return res.status(400).json({ message: 'Label name is required.' });
        }

        // Get the start and end of the current day
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Check if a verification entry already exists for this user and label today
        const existingVerification = await VerificationData.findOne({
            user: req.user.id,
            labelName,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        });

        if (existingVerification) {
            return res.status(400).json({ message: 'Already verified recently.' });
        }

        // Store new verification
        const verification = new VerificationData({
            user: req.user.id,
            labelName,
        });

        await verification.save();
        res.status(201).json({ message: 'Verification data stored successfully.' });
    } catch (error) {
        console.error('Error storing verification data:', error);
        res.status(500).json({ message: 'Failed to store verification data.' });
    }
});

router.get('/verification-history', fetchuser, async (req, res) => {
    try {
        const user = req.user.id; // Assuming middleware sets req.user
        const history = await VerificationData.find({ user });
        res.json({ history });
    } catch (error) {
        console.error('Error fetching verification history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;









