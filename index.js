const connectToMongo = require('./db')
const express = require('express')
const bodyParser = require('body-parser');
// const campaign1User = require('./models/User');
// const campaign2User = require('./models/campaign2');
const User = require('./models/User');
const sendMail = require('./utils/sendMail');
const path = require('path')
const ExcelJS = require('exceljs');
const { signinPage, createUser, login, getUser } = require("./controllers/signin");
const { createCampaign, getAllCampaigns } = require("./controllers/CampaignInfo");
const fetchuser = require('./middleware/fetchuser');
const XLSX = require('xlsx');
const multer = require('multer');
const getGeolocation = require('./utils/getApproxLocation');
const Campaign = require('./models/Campaign');


connectToMongo();
const app = express()
app.use(bodyParser.json());

// handling static files 
app.use(express.static(path.join(process.cwd(), 'public')));

// handling ejs specific stuff
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

const port = 5000

app.get('/', (req, res) => {
    res.render('DataVisualization.ejs')
})
app.get('/user/reported', (req, res) => {
    res.render('reports.ejs')
})
app.get('/user/viewDetails/:id', (req, res) => {
    res.render('UserDetails.ejs')
})
app.get('/signinpage', (req, res) => {
    res.render('SigninPage.ejs')
})
app.get('/newVisualization', (req, res) => {
    res.render('DataVisualizationNew.ejs')
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
            const existingUser = await User.findOne({ emailId: email });
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
        //  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
         const ipAddress = "103.206.182.96";


        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Increment the linkOpenCount
        user.linkOpenCount += 1;
        const location = getGeolocation(ipAddress);
        user.ipAddress = ipAddress;
        user.location = location ? location : {};

        // Save the updated user to the database
        await user.save();

        // Send a success response
        // res.status(200).json({ message: 'linkOpenCount incremented successfully', user });
        res.render('SigninPage.ejs', {data: userId});
    } catch (error) {
        // If an error occurs, send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// // Defined API endpoint to increment attachmentOpenCount
// app.get('/incrementAttachmentOpenCount/:userId', async (req, res) => {
//     try {
//         // Extract userId from request parameters
//         const userId = req.params.userId;

//         // Find the user by userId
//         const user = await User.findById(userId);

//         if (user) {
//             user.attachmentOpenCount += 1;
//             await user.save();
//         }

//         // Respond with a 1x1 transparent GIF image
//         res.sendFile('pixel.jpg', { root: __dirname });
//     } catch (error) {
//         // If an error occurs, send an error response
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

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

app.get('/aggregate-user-stats', async (req, res) => {
    try {
        // Aggregate data from all users
        const aggregateStats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 }, // Total number of users
                    totalLinkOpenCount: { $sum: { $cond: { if: { $gt: ['$linkOpenCount', 0] }, then: 1, else: 0 } } },
                    totalEmailOpenCount: { $sum: { $cond: { if: { $gt: ['$emailOpenCount', 0] }, then: 1, else: 0 } } },
                    totalAttachmentOpenCount: { $sum: { $cond: { if: { $gt: ['$attachmentOpenCount', 0] }, then: 1, else: 0 } } },
                    totalSubmittedData: { $sum: { $cond: { if: { $gt: ['$submittedData', 0] }, then: 1, else: 0 } } }
                }
            }
        ]);

        // Extract aggregated data
        const { totalUsers, totalLinkOpenCount, totalEmailOpenCount, totalAttachmentOpenCount, totalSubmittedData } = aggregateStats[0];

        // Calculate percentages
        const linkOpenPercentage = (totalLinkOpenCount / totalUsers) * 100;
        const emailOpenPercentage = (totalEmailOpenCount / totalUsers) * 100;
        const attachmentOpenPercentage = (totalAttachmentOpenCount / totalUsers) * 100;

        // Return the aggregated data as JSON
        res.json({ totalUsers, totalLinkOpenCount, totalEmailOpenCount, totalAttachmentOpenCount, totalSubmittedData });
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
            const imageUrl = `https://phishingmails.onrender.com/track.gif?userId=${userId}`;
            const phishingLink = `https://phishingmails.onrender.com/incrementLinkOpenCount/${userId}`;

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
                UniqueLinkOpen: `https://svp-eci-indiagov.org/voterportal/${user._id}`,
                UniqueImageOpen: `https://svp-eci-indiagov.org/track.gif?userId=${user._id}`,
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

app.get('/signin', signinPage)
app.post('/createuser', createUser)
app.post('/login', login)
app.get('/getuser', fetchuser, getUser)

app.post('/createCampaign', createCampaign);
app.get('/campaigns', getAllCampaigns);


app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})