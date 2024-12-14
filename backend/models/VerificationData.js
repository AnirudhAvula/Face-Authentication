const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Assuming there is a 'User' model
        required: true,
    },
    labelName: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation timestamp
    },
});


const VerificationData = mongoose.model('VerificationData', VerificationSchema);
module.exports = VerificationData;