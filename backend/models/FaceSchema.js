
const { type } = require('@testing-library/user-event/dist/type')
const mongoose = require('mongoose')

const faceSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required: true
    },
    name: {
        type : String,
        required :true
    },
    rollno:{
        type: String,
        required: true
    },
    year:{
        type: Number,
        required: true
    },
    branch:{
        type: String,
        required: true
    },
    section:{
        type: String,
        required: true
    },
    embedding :{
        type : Array, //Store as an array of numbers
        required : true
    },
    createdAt : {
        type : Date,
        default: Date.now
    }

});

module.exports = mongoose.model('FaceEmbedding',faceSchema);