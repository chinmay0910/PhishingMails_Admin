const mongoose = require('mongoose');

// Define a schema for campaign data
const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // Campaign name is mandatory
    },
    createdDate: {
        type: Date,
        default: Date.now // Automatically sets the current date and time
    }
});

// Create a model for the campaign
const Campaign = mongoose.model('CampaignInfo', campaignSchema);

module.exports = Campaign;
