const mongoose = require('mongoose');

// Define a schema for user data
const campaign2userSchema = new mongoose.Schema({
    emailId: {
        type: String,
        required: true,
        unique: true // Assuming each email is unique
    },
    linkOpenCount: {
        type: Number,
        default: 0 // Default value is 0
    },
    emailOpenCount: {
        type: Number,
        default: 0 // Default value is 0
    },
    attachmentOpenCount: {
        type: Number,
        default: 0 // Default value is 0
    },
    submittedData: {
        type: Number,
        default: 0
    },
    reportedSpam: {
        type: Boolean,
        default: false
    },
    submittedContent: [{
        username: String,
        password: String,
        category: String,
        mobileNo: String,
        otp: String,
    }],
});

// Create a model based on the schema
const campaign2users = mongoose.model('campaign2users', campaign2userSchema);

module.exports = campaign2users;
