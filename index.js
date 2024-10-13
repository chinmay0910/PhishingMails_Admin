const connectToMongo = require('./db')
const mongoose = require('mongoose');
const express = require('express')
const bodyParser = require('body-parser');
const User = require('./models/User');
const sendMail = require('./utils/sendMail');
const path = require('path')
const fs = require('fs');
const ExcelJS = require('exceljs');
const { signinPage, createUser, login, getUser } = require("./controllers/signin");
const { createCampaign, getAllCampaigns } = require("./controllers/CampaignInfo");
const fetchuser = require('./middleware/fetchuser');
const XLSX = require('xlsx');
const multer = require('multer');
const getGeolocation = require('./utils/getApproxLocation');
const generateOdtDocument = require("./utils/generateODTfile");
const Campaign = require('./models/Campaign');
const ObjectId = mongoose.Types.ObjectId;
const cors = require('cors');
const archiver = require('archiver');

connectToMongo();
const app = express()
app.use(cors());
app.use(bodyParser.json());

// handling static files 
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.static(path.join(process.cwd(), 'uploads')));

// handling ejs specific stuff
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

const port = 5000

app.get('/user/reported', (req, res) => {
    res.render('reports.ejs')
})
app.get('/user/viewDetails/:id', (req, res) => {
    res.render('UserDetails.ejs')
})
app.get('/signinpage', (req, res) => {
    res.render('SigninPage.ejs')
})
app.get('/', (req, res) => {
    res.render('DataVisualizationNew.ejs')
})
app.get('/previousCampaign', (req, res) => {
    res.render('DataVisualization.ejs')
})
app.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate('campaignId'); // Populate campaign info if needed

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const upload = multer({ dest: 'uploads/' }); // Define upload directory

// Define route for uploading Excel file
app.post('/upload', upload.single('file'), async (req, res) => {
    try {        
        const { campaignId } = req.body; // Extract campaignId from request body

        if (!campaignId) {
            return res.status(400).json({ message: 'campaignId is required' });
        }

        // Read the Excel file
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const emailColumn = 'A'; // Assuming emails are in the first column

        const emailAddresses = [];
        let i = 1;
        while (true) {
            const cell = sheet[emailColumn + i];
            if (!cell || !cell.v) {
                break;
            }
            emailAddresses.push(cell.v);
            i++;
        }

        // Create users from email addresses
        const users = await Promise.all(emailAddresses.map(async (email) => {
            const existingUser = await User.findOne({ emailId: email, campaignId: campaignId });
            if (existingUser) {
                return existingUser;
            }
            return User.create({ 
                emailId: email,
                campaignId, // Assign campaignId to each user
                linkOpenCount: 0,
                emailOpenCount: 0,
                attachmentOpenCount: 0,
                submittedData: 0,
                reportedSpam: false 
            });
        }));

        res.status(200).json({ message: 'Users created successfully', users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/delete-users', async (req, res) => {
    try {
        // Extract userIds from the request body
        const { userIds } = req.body;

        // Validate the userIds input
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ success: false, message: 'No user IDs provided.' });
        }

        // Delete users with the specified IDs
        await User.deleteMany({ _id: { $in: userIds } });

        // Send a success response
        res.json({ success: true, message: 'Users deleted successfully.' });
    } catch (error) {
        // Handle errors
        console.error('Error deleting users:', error);
        res.status(500).json({ success: false, message: 'Failed to delete users.' });
    }
});


// Return the user's email based on ID
app.get('/user/:id', async (req, res) => {
    try {
        // Extract user ID from the request parameters
        const userId = req.params.id;

        // Find the user by ID
        const user = await User.findById(userId);

        // If user does not exist, return a 404 error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the user's email
        res.status(200).json({ emailId: user.emailId });
    } catch (error) {
        // Handle any errors
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.use('/api/record/', require('./routes/updateActivity'))

app.post('/users', async (req, res) => {
    try {
        // Extract data from the request body
        const { emailId, campaignId } = req.body;
    

        // Check if a user with the same emailId already exists
        const existingUser = await User.findOne({ emailId, campaignId });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create a new user object
        const newUser = new User({
            emailId,
            campaignId,
            linkOpenCount: 0,
            emailOpenCount: 0,
            attachmentOpenCount: 0,
            submittedData: 0,
            reportedSpam: false
        });

        // Save the new user to the database
        await newUser.save();

        // Send a success response
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        // If an error occurs, send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/users-emails/:campaignId', async (req, res) => {
    try {
        // Fetch all users from the database
        const campaignId = req.params.campaignId;

        // Fetch the campaign name
        const campaign = await Campaign.findById(campaignId).select('name');
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        const users = await User.find({campaignId}, '_id emailId reportedSpam'); // Assuming the fields are named '_id' and 'email' in the User model

        // Send the list of users with their IDs and emails as JSON response
        res.json({
            campaignName: campaign.name,
            users
        });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// // Defined API endpoint to increment linkOpenCount
app.get('/incrementLinkOpenCount/:userId', async (req, res) => {
    try {
        // Extract userId from request parameters
        const userId = req.params.userId;


        //  Capture the user's IP address from the request   
         const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        //  const ipAddress = "103.49.255.23, 255.102.0.0";


        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Increment the linkOpenCount
        user.linkOpenCount += 1;
        user.Date = Date.now();
        const location = getGeolocation(ipAddress.split(",")[0]);
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

// // Defined API endpoint to increment attachmentOpenCount
app.get('/incrementAttachmentOpenCount/:userId', async (req, res) => {
    try {
        // Extract userId from request parameters
        const userId = req.params.userId;

        // Find the user by userId
        const user = await User.findById(userId);

        if (user) {
            user.attachmentOpenCount += 1;
            
            //  Capture the user's IP address from the request   
            const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const location = getGeolocation(ipAddress.split(",")[0]);
            user.ipAddress = ipAddress;
            user.location = location ? location : {};
            
            await user.save();
        }

        // Respond with a 1x1 transparent GIF image
        res.sendFile('pixel.jpg', { root: __dirname });
    } catch (error) {
        // If an error occurs, send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// // Defined route to handle form submission
// app.post('/login', async (req, res) => {
//     try {
//       const { username, password, userId } = req.body;

//       // Update the submittedData field for the user with the provided userId
//       await User.findByIdAndUpdate(userId, { $inc: { submittedData: 1 } });

//       // You can add additional logic here for authentication, etc.

//       res.status(200).json({ message: 'Form submitted successfully' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });



// Defined API endpoint to fetch aggregated user stats

// app.get('/aggregate-user-stats', async (req, res) => {
//     try {
//         // Aggregate data from all users
//         const aggregateStats = await User.aggregate([
//             {
//                 $group: {
//                     _id: null,
//                     totalUsers: { $sum: 1 }, // Total number of users
//                     totalLinkOpenCount: { $sum: { $cond: { if: { $gt: ['$linkOpenCount', 0] }, then: 1, else: 0 } } },
//                     totalEmailOpenCount: { $sum: { $cond: { if: { $gt: ['$emailOpenCount', 0] }, then: 1, else: 0 } } },
//                     totalAttachmentOpenCount: { $sum: { $cond: { if: { $gt: ['$attachmentOpenCount', 0] }, then: 1, else: 0 } } },
//                     totalSubmittedData: { $sum: { $cond: { if: { $gt: ['$submittedData', 0] }, then: 1, else: 0 } } }
//                 }
//             }
//         ]);

//         // Extract aggregated data
//         const { totalUsers, totalLinkOpenCount, totalEmailOpenCount, totalAttachmentOpenCount, totalSubmittedData } = aggregateStats[0];


//         // Return the aggregated data as JSON
//         res.json({ totalUsers, totalLinkOpenCount, totalEmailOpenCount, totalAttachmentOpenCount, totalSubmittedData });
//     } catch (error) {
//         // Handle errors
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

app.get('/aggregate-user-stats/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;

        // Convert campaignId to ObjectId
        const campaignObjectId = new ObjectId(campaignId);

        // Aggregate data for the specific campaign
        const aggregateStats = await User.aggregate([
            {
                $match: { campaignId: campaignObjectId } // Filter by campaignId (ObjectId)
            },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 }, // Total number of users
                    totalLinkOpenCount: { $sum: { $cond: { if: { $gt: ['$linkOpenCount', 0] }, then: 1, else: 0 } } },
                    totalEmailOpenCount: { $sum: { $cond: { if: { $gt: ['$emailOpenCount', 0] }, then: 1, else: 0 } } },
                    totalAttachmentOpenCount: { $sum: { $cond: { if: { $gt: ['$attachmentOpenCount', 0] }, then: 1, else: 0 } } },
                    totalSubmittedData: { $sum: { $cond: { if: { $gt: ['$submittedData', 0] }, then: 1, else: 0 } } },
                    reportedSpamCount: { $sum: { $cond: { if: { $eq: ['$reportedSpam', true] }, then: 1, else: 0 } } }, // Count of users who reported spam
                    notReportedSpamCount: { $sum: { $cond: { if: { $eq: ['$reportedSpam', false] }, then: 1, else: 0 } } } // Count of users who did not report spam
                }
            }
        ]);

        // Extract aggregated data
        if (aggregateStats.length > 0) {
            const { totalUsers, totalLinkOpenCount, totalEmailOpenCount, totalAttachmentOpenCount, totalSubmittedData, reportedSpamCount, notReportedSpamCount } = aggregateStats[0];

            // Return the aggregated data as JSON
            res.json({ totalUsers, totalLinkOpenCount, totalEmailOpenCount, totalAttachmentOpenCount, totalSubmittedData, reportedSpamCount, notReportedSpamCount });
        } else {
            res.status(404).json({ message: 'No data found for the specified campaignId' });
        }
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Route to handle tracking requests
app.get('/track.gif', async (req, res) => {
    try {
        const { userId } = req.query;

        // Update the user's emailOpenCount in the database
        const user = await User.findById(userId);
        if (user) {
            user.emailOpenCount += 1;
            user.Date = Date.now();
            await user.save();
        }

        // Respond with a 1x1 transparent GIF image
        res.sendFile('pixel.jpg', { root: __dirname });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});


// Defined API endpoint to send emails
app.post('/send-email', async (req, res) => {
    try {
        const { subject, message, userId, campaignId } = req.body;

        let users = [];

        // Check if the request contains a campaignId for bulk sending
        if (campaignId) {
            // Fetch all users in the campaign
            users = await User.find({ campaignId }, '_id emailId');
        } else if (userId) {
            // Fetch a single user by userId
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            users.push(user);
        }

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found for this campaign' });
        }

        // Create an array of email promises
        const emailPromises = users.map((user) => {
            const emailId = user.emailId;
            const userId = user._id;

            // Dynamically construct the phishing link and tracking image URL using the userId
            const imageUrl = `https://phishingmails-admin.onrender.com/track.gif?userId=${userId}`;
            const phishingLink = `https://phishingmails-admin.onrender.com/incrementLinkOpenCount/${userId}`;

            // Replace placeholders in the message with actual content
            const htmlContent = message
                .replace(/{{link}}/g, `<a href="${phishingLink}">${phishingLink}</a>`)
                .replace(/{{trackingPixel}}/g, `<img src="${imageUrl}" alt="Tracking Pixel">`);

            // Send email using the sendMail function
            return sendMail(emailId, subject || "Phishing email", htmlContent);
        });

        // Use Promise.all to send all emails in parallel
        await Promise.all(emailPromises);

        // Send a success response
        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send emails' });
    }
});

app.get('/generate-document/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    // Fetch the emailId for the provided userId (from your database)
    const user = await User.findById(userId);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const emailId = user.emailId;
    const templatePath = path.join(__dirname, '/public/templates/', 'Facilities Extended Under NHM to Defence Service.odt');

    try {
        // Call the utility function to generate the ODT document
        const odtBuffer = generateOdtDocument(userId, emailId, templatePath);
        
        // Set content-disposition to attachment to trigger a download
        res.setHeader('Content-Disposition', `attachment; filename="${emailId}.odt"`);
        res.setHeader('Content-Type', 'application/vnd.oasis.opendocument.text');
        
        // Send the file as a response
        res.send(odtBuffer);
    } catch (error) {
        console.error('Error generating document:', error);
        res.status(500).json({ error: 'Error generating document' });
    }
});

app.get('/generate-zip-documents/:campaignId', async (req, res) => {
    try {
        // Fetch all users from your database
        const campaignId = req.params.campaignId;
        const users = await User.find({campaignId});
        
        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }

        // Create a zip stream
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level
        });

        // Set headers for zip download
        res.setHeader('Content-Disposition', 'attachment; filename=documents.zip');
        res.setHeader('Content-Type', 'application/zip');

        // Pipe the zip output to the response
        archive.pipe(res);

        // Loop through users and add their ODT documents to the archive
        for (const user of users) {
            const emailId = user.emailId;
            const userId = user._id.toString();
            const templatePath = path.join(__dirname, '/public/templates/', 'Facilities Extended Under NHM to Defence Service.odt');

            // Generate ODT document
            const odtBuffer = generateOdtDocument(userId, emailId, templatePath);

            // Append the generated file to the ZIP archive
            archive.append(odtBuffer, { name: `${emailId}/Facilities Extended Under NHM to Defence Service.odt` });
        }

        // Finalize the archive (this will trigger sending the zip to the client)
        await archive.finalize();
    } catch (error) {
        console.error('Error generating ZIP:', error);
        res.status(500).json({ error: 'Error generating ZIP' });
    }
});

app.put('/edit/:id', async (req, res) => {
    try {
        // Extract user ID from the request parameters
        const userId = req.params.id;
console.log(userId);
        // Extract the emailId from the request body
        const { emailId } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);

        // If user does not exist, return an error response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the new emailId already exists for the same campaign
        const existingUser = await User.findOne({ emailId, campaignId: user.campaignId });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({ message: 'Another user already exists with this email in the same campaign' });
        }

        // Update the user's emailId
        user.emailId = emailId;

        // Save the updated user to the database
        await user.save();

        // Send a success response
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        // If an error occurs, send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Defined route to handle form submission
app.post('/user/login', async (req, res) => {
    try {
      const { username, password, category, userId } = req.body;
  
      // Update the submittedData field for the user with the provided userId
      await User.findByIdAndUpdate(userId, { $inc: { submittedData: 1 } });
      await User.findByIdAndUpdate(userId, { $push: { submittedContent: { username, password, category } } });
  
      // You can add additional logic here for authentication, etc.
  
      res.status(200).json({ message: 'Form submitted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


app.put('/accept-report/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { action } = req.body;

        // Find the user by ID
        const user = await User.findById({_id: userId});

        // If user not found, return 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update reportedSpam to true
        user.reportedSpam = action;

        // Save the updated user
        await user.save();

        // Send updated user object as response
        res.json(user);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Endpoint to download users data in Excel format
app.get('/download-users-excel/:campaignNo', async (req, res) => {
    try {
        // Fetch all users from the database
        const campaignId = req.params.campaignNo;
        const users = await User.find({campaignId});

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        // Define column headers
        worksheet.columns = [
            { header: 'User ID', key: '_id', width: 20 },
            { header: 'Email', key: 'emailId', width: 30 },
            { header: 'Link Open Count', key: 'linkOpenCount', width: 20 },
            { header: 'Email Open Count', key: 'emailOpenCount', width: 20 },
            { header: 'Attachment Open Count', key: 'attachmentOpenCount', width: 20 },
            { header: 'Submitted Data', key: 'submittedData', width: 20 },
            { header: 'Reported Spam', key: 'reportedSpam', width: 20 },
            { header: 'Submitted Content', key: 'submittedContent', width: 20 },
            { header: 'LinkOpenCount Increment Link', key: 'UniqueLinkOpen', width: 60 },
            { header: 'EmailOpenCount Increment Link', key: 'UniqueImageOpen', width: 60 }
        ];

        // Add rows for each user
        users.forEach(user => {
            worksheet.addRow({
                _id: user._id,
                emailId: user.emailId,
                linkOpenCount: user.linkOpenCount,
                emailOpenCount: user.emailOpenCount,
                attachmentOpenCount: user.attachmentOpenCount,
                submittedData: user.submittedData,
                reportedSpam: user.reportedSpam ? 'Yes' : 'No',
                submittedContent: user.submittedContent.length > 0 ?
                    `Usernames: ${user.submittedContent.map(data => data.username)} Passwords: ${user.submittedContent.map(data => data.password)},` :
                    (user.submittedContent.length > 0 ?
                        user.submittedContent.map(data => {
                            let content = `Username: ${data.username}\nPassword: ${data.password}\nCategory: ${data.category}\nfull Name: ${data.name}\nphone: ${data.phone}`;
                            if (data.mobileNo) {
                                content += `\nMobile No: ${data.mobileNo}`;
                            }
                            return content;
                        }).join("\n") : "Not Submitted"
                    ),
                UniqueLinkOpen: `http://20.197.5.62:5000/consent/${user._id}`,
                UniqueImageOpen: `http://20.197.5.62:5000/track.gif?userId=${user._id}`,
            });
        });

        // Set response headers for Excel download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

        // Write the workbook to response
        await workbook.xlsx.write(res);

        // End the response
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// app.get('/useractivity/:campaignId', async (req, res) => {
//     try {
//         const { campaignId } = req.params;

//         // Convert campaignId to ObjectId
//         const campaignObjectId = new ObjectId(campaignId);

//         // Fetch the required data from the User collection filtered by campaignId
//         const users = await User.aggregate([
//             {
//                 $match: { campaignId: campaignObjectId } // Filter by campaignId (ObjectId)
//             },
//             {
//                 $group: {
//                     _id: { 
//                         date: { 
//                             $dateToString: { format: "%Y-%m-%d", date: "$Date" } 
//                         }
//                     },
//                     emailOpenCount: { $sum: "$emailOpenCount" },
//                     // attachmentOpenCount: { $sum: "$attachmentOpenCount" }
//                     attachmentOpenCount: { $sum: { $cond: { if: { $gt: ['$attachmentOpenCount', 0] }, then: 1, else: 0 } } },
//                 }
//             },
//             {
//                 $sort: { "_id.date": 1 }
//             }
//         ]);

//         // Filter out any null or undefined dates
//         const filteredUsers = users.filter(user => user._id.date !== null && user._id.date !== undefined);

//         // Format the data for the chart
//         const seriesData = [
//             {
//                 name: 'Email Open Count',
//                 data: filteredUsers.map(user => user.emailOpenCount)
//             },
//             {
//                 name: 'Attachment Open Count',
//                 data: filteredUsers.map(user => user.attachmentOpenCount)
//             }
//         ];

//         const xAxisCategories = filteredUsers.map(user => user._id.date);

//         // Send the data as a response
//         res.json({
//             seriesData,
//             xAxisCategories
//         });
//     } catch (error) {
//         console.error('Error fetching user activity data:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


app.get('/useractivity/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;

        // Convert campaignId to ObjectId
        const campaignObjectId = new ObjectId(campaignId);

        // Fetch the required data from the User collection filtered by campaignId
        const users = await User.aggregate([
            {
                $match: { campaignId: campaignObjectId } // Filter by campaignId (ObjectId)
            },
            {
                $group: {
                    _id: { 
                        date: { 
                            $dateToString: { format: "%Y-%m-%d", date: "$Date" } 
                        }
                    },
                    linkOpenCount: { $sum: "$linkOpenCount" },
                    // attachmentOpenCount: { $sum: "$attachmentOpenCount" }
                    attachmentOpenCount: { $sum: { $cond: { if: { $gt: ['$attachmentOpenCount', 0] }, then: 1, else: 0 } } },
                }
            },
            {
                $sort: { "_id.date": 1 }
            }
        ]);

        // Filter out any null or undefined dates
        const filteredUsers = users.filter(user => user._id.date !== null && user._id.date !== undefined);

        // Format the data for the chart
        const seriesData = [
            {
                name: 'Link Open Count',
                data: filteredUsers.map(user => user.linkOpenCount)
            },
            {
                name: 'Attachment Open Count',
                data: filteredUsers.map(user => user.attachmentOpenCount)
            }
        ];

        const xAxisCategories = filteredUsers.map(user => user._id.date);

        // Send the data as a response
        res.json({
            seriesData,
            xAxisCategories
        });
    } catch (error) {
        console.error('Error fetching user activity data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/submissions-heatmap/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const campaignObjectId = new ObjectId(campaignId);

        // Aggregate submissions count by day for the specific campaign
        const data = await User.aggregate([
            { $match: { campaignId: campaignObjectId } }, // Filter by campaign ID
            {
                $group: {
                    _id: {
                        year: { $year: "$Date" },
                        month: { $month: "$Date" },
                        day: { $dayOfMonth: "$Date" }
                    },
                    submissionsCount: { $sum: "$submittedData" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
            }
        ]);

        // Format data for heatmap with null checks and remove invalid entries
        const formattedData = data.map(item => {
            // Check if _id and its subfields are not null or undefined
            if (item._id && item._id.year !== undefined && item._id.month !== undefined && item._id.day !== undefined) {
                const formattedDate = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
                return {
                    x: formattedDate,
                    y: item.submissionsCount || 0 // Default value if submissionsCount is null
                };
            } else {
                // Log unexpected data format
                console.warn('Unexpected data format:', item);
                return null;
            }
        }).filter(item => item !== null && item.x !== 'null-null-null'); // Remove null and invalid entries

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching heatmap data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/user-actions/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;

        // Convert campaignId to ObjectId
        const campaignObjectId = new mongoose.Types.ObjectId(campaignId);

        // Find users who have performed any actions or met additional conditions for the specified campaign
        const users = await User.find({
            campaignId: campaignObjectId,
            $or: [
                { linkOpenCount: { $gt: 0 } },
                { emailOpenCount: { $gt: 0 } },
                { attachmentOpenCount: { $gt: 0 } },
                { submittedData: { $gt: 0 } },
                { reportedSpam: true }
            ]
        })
        .select('emailId linkOpenCount emailOpenCount attachmentOpenCount submittedData reportedSpam') // Include all relevant fields
        .exec();

        // Map user data to a format suitable for the frontend
        const userActions = users.map(user => {
            return {
                name: user.emailId,
                actions: {
                    linkOpened: user.linkOpenCount > 0,
                    emailOpened: user.emailOpenCount > 0,
                    attachmentOpened: user.attachmentOpenCount > 0,
                    submittedData: user.submittedData > 0,
                    reportedSpam: user.reportedSpam
                }
            };
        });

        // Return the user actions data as JSON
        res.json(userActions);
    } catch (error) {
        // Handle errors
        console.error('Error fetching user actions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/signin', signinPage)
app.post('/createuser', createUser)
app.post('/login', login)
app.get('/getuser', fetchuser, getUser)

app.post('/createCampaign', createCampaign);
app.get('/campaigns', getAllCampaigns);


app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})