const express = require('express')
const router = express.Router()
const axios = require('axios');
const FaceEmbedding = require('../models/FaceSchema');
const FaceEmbeddingCNN = require('../models/FaceSchemaCNN');
const fetchuser = require('../middleware/fetchuser');
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// Register Face - Calls Python service to generate embedding, then saves it in MongoDB

const identifiedPersons = {}; // Ensure this is defined globally

router.post('/register-face', fetchuser, async (req, res) => {
    try {
        console.log(req.body);
        // const { name, embedding } = req.body;
        const name = req.body.name;
        const embeddings = req.body.embeddings
        const rollno = req.body.rollno
        const branch = req.body.branch
        const year = req.body.year
        const section = req.body.section

        
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
            rollno,
            year,
            branch,
            section,
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
router.post('/register-face-cnn', fetchuser, async (req, res) => {
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
            

        const newFace = new FaceEmbeddingCNN({
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
            //Add the identified person to the in-memory store
            if(!identifiedPersons[req.user.id]){
                identifiedPersons[req.user.id]=[]
            }

            const alreadyIdentified = identifiedPersons[req.user.id].some(
                (person) => person.name === bestMatch.name
            );
            if (!alreadyIdentified) {
                identifiedPersons[req.user.id].push({
                    name: bestMatch.name,
                    rollNumber: bestMatch.rollno || "N/A",
                    branch: bestMatch.branch || "N/A",
                    section: bestMatch.section || "N/A",
                    year: bestMatch.year || "N/A",
                    identifiedAt: new Date(),
                });
            }

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
        
            console.log("Current Identified Persons:", identifiedPersons);

            
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
router.get('/identified-persons', fetchuser, (req, res) => {
    const userId = req.user.id;
    const userIdentifiedPersons = identifiedPersons[userId] || [];
    res.status(200).json({ identifiedPersons: userIdentifiedPersons });
});

router.get('/export-excel', fetchuser , async (req,res)=>{
    try{
        const persons = identifiedPersons[req.user.id] || [];

        if(persons.length ===0){
            return res.status(404).json({error: "No identified persons to export"})
        }

        // Prepare data for Excel
        const data = persons.map((person) => ({
            Name: person.name,
            RollNumber: person.rollNumber,
            Class: person.class,
            Section: person.section,
            Year: person.year,
            IdentifiedAt: new Date(person.identifiedAt).toLocaleString('en-US',{
                timeZone: 'Asia/Kolkata',
            }),
        }));
        // Create 'exported_files' directory if it doesn't exist
        const exportDir = path.join(__dirname, 'exported_files');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        // Create a new workbook and sheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "IdentifiedPersons");

        // Save Excel file
        const filePath = path.join(__dirname, "exported_files", `identified_persons_${Date.now()}.xlsx`);
        XLSX.writeFile(workbook, filePath);

        // const fileName = `identified_persons_${Date.now()}.xlsx`;
        // // Send the file as a response
        // try{
        //     res.download(filePath, fileName);
        // } catch (err) {
        //     console.error("Error while sending the file:", err);
        //     return res.status(500).send("Error exporting to Excel");
        // }
        

        // Send the file as a binary response
        res.setHeader('Content-Disposition', `attachment; filename=identified_persons_${Date.now()}.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error("Error while sending the file:", err);
                res.status(500).send("Error exporting to Excel");
            }
    //             // Clear the identifiedPersons for the current user after the file is successfully sent
    // delete identifiedPersons[req.user.id];
    // console.log("Cleared identified persons for user:", req.user.id);
        });

    }catch (error) {
        console.error("Error exporting to Excel:", error);
        res.status(500).send("Internal Server Error");
    }
})


    
module.exports = router;






