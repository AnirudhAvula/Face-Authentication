const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/faceauth"


const connectToMongo =()=>{
      mongoose.connect(mongoURI);
}

module.exports=connectToMongo;
