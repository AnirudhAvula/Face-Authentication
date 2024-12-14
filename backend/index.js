const connectToMongo = require('./db') //importing connectToMongo from db.js
const express = require('express');
var cors = require('cors') //importing cors to allow cross - origin resource sharing 

connectToMongo();
const app =express();
const port = 5000;



app.use(cors({
    origin: 'http://localhost:3000',//Specify frontend port
    methods: ['GET', 'POST', 'OPTIONS','DELETE','PUT'],
    //  allowedHeaders: ['Content-Type', 'auth-token'],
    optionsSuccessStatus:200
}))

// For further compatibility, explicitly handle preflight requests
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

//Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/face', require('./routes/faceAuth'))


app.listen(port , ()=>{
    console.log(`FR App Backend Listening at http://localhost:${port}`);
})

