const express = require('express')
const router = express.Router()
const axios = require('axios');
const FaceEmbedding = require('../models/FaceSchema');
const fetchuser = require('../middleware/fetchuser');

// Register Face - Calls Python service to generate embedding, then saves it in MongoDB


router.post('/register-face', fetchuser, async (req, res) => {
    try {
        console.log(req.body);
        // const { name, embedding } = req.body;
        const name = req.body.name;
        const embeddings = req.body.embeddings

        
        if (!name || !embeddings) {
            return res.status(400).json({ error: "Name and embedding are required" });
        }

                // Ensure embeddings is a 2D array
                if (!Array.isArray(embeddings) || !embeddings.every(Array.isArray)) {
                    return res.status(400).json({ error: "Embeddings must be a 2D array" });
                }

            // Flatten the 2D array of embeddings into a single array of embeddings
            // const flattenedEmbeddings = embedding.map(embedding => embedding[0]);

                // Calculate the average of the embeddings
                const numEmbeddings = embeddings.length;
                console.log("Number of embeddings received: ",numEmbeddings)
                const numDimensions = embeddings[0].length; // Assuming all embeddings have the same length
                console.log("Number of Dimensions: ",numDimensions)

                // Initialize an array to hold the sum of each dimension
                const sumEmbeddings = new Array(numDimensions).fill(0);
                for (const embedding of embeddings) {
                    for (let i = 0; i < numDimensions; i++) {
                        sumEmbeddings[i] += embedding[i]; // Accessing the first element of each embedding
                    }
                }

                // Calculate averaged embedding
                
                const averagedEmbedding = sumEmbeddings.map(value => value / numEmbeddings);
                
                
                // const averagedEmbedding = flattenedEmbeddings.reduce((avg, emb) => {
                //     return avg.map((value, index) => value + emb[index]);
                // }, new Array(flattenedEmbeddings[0].length).fill(0)).map(value => value / flattenedEmbeddings.length);
            

        const newFace = new FaceEmbedding({
            user: req.user.id, // Link embedding to logged-in user
            name,
            embedding: averagedEmbedding, // Store the averaged embedding
        });
        console.log(averagedEmbedding)

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
        const threshold = 0.6; // Set an appropriate threshold based on your model's performance
        if (minDistance <= threshold && bestMatch) {
            return res.status(200).json({
                message: "Person identified successfully",
                name: bestMatch.name,
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
module.exports = router;






