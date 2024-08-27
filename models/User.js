const mongoose = require('mongoose');

// Define a schema for user data
const userSchema = new mongoose.Schema({
    emailId: {
        type: String,
        required: true,
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
        password: String
    }],
    campaignId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Campaign schema
        ref: 'CampaignInfo',
        required: true
    },
    ipAddress: {
        type: String, 
        default: "Not Found"
    },
    location: {
        country: String,
        region: String,
        city: String,
        coordinates: [Number] // [latitude, longitude]
    }
});

// Create a model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
