const Campaign = require('../models/Campaign'); 

// Controller function to create a new campaign
const createCampaign = async (req, res) => {
    try {
        const { name } = req.body;

        // Validate campaign name
        if (!name) {
            return res.status(400).json({ message: 'Campaign name is required.' });
        }

        // Create a new campaign
        const newCampaign = new Campaign({
            name: name,
            createdDate: new Date() // Current date and time
        });

        // Save the campaign to the database
        const savedCampaign = await newCampaign.save();

        return res.status(201).json({
            message: 'Campaign created successfully!',
            campaign: savedCampaign
        });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while creating the campaign.', error: error.message });
    }
};

// get all the Campaigns
const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({});
        res.status(200).json(campaigns);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    createCampaign,
    getAllCampaigns
};
