const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Utility function to generate ODT document
const generateOdtDocument = (userId, emailId, templatePath, outputFolder) => {
    const inputBuf = fs.readFileSync(templatePath);
    const inputZip = new AdmZip(inputBuf);
    const outputZip = new AdmZip();

    // Generate timestamps
    const now = new Date();
    const nowTs = now.toISOString().replace('T', ' ').substring(0, 19);

    const randomDays = Math.floor(Math.random() * 25) + 1;
    const randomHours = Math.floor(Math.random() * 24) + 1;
    const randomSeconds = Math.floor(Math.random() * 60) + 1;
    const createdTsDate = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000) - (randomHours * 60 * 60 * 1000) - (randomSeconds * 1000));
    const createdTs = createdTsDate.toISOString().replace('T', ' ').substring(0, 19);

    inputZip.getEntries().forEach(entry => {
        if (entry.entryName === "content.xml") {
            let content = entry.getData().toString('utf-8');
            const trackingLink = `https://phishingmails-admin.onrender.com/incrementAttachmentOpenCount/${userId}`;
            content = content.replace("HONEYDROP_TOKEN_URL", trackingLink);
            content = content.replace("aaaaaaaaaaaaaaaaaaaa", createdTs);
            content = content.replace("bbbbbbbbbbbbbbbbbbbb", nowTs);
            outputZip.addFile(entry.entryName, Buffer.from(content, 'utf-8'));
        } else {
            outputZip.addFile(entry.entryName, entry.getData());
        }
    });

    const outputPath = path.join(outputFolder, `${emailId}.odt`);
    fs.writeFileSync(outputPath, outputZip.toBuffer());
    return outputPath;
};

module.exports = generateOdtDocument;
