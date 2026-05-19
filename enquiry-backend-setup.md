# Google Apps Script Backend Setup Guide

This guide explains how to set up the backend for the premium popup enquiry modal using Google Sheets, Google Drive, and Google Apps Script. 

## Phase 1: Set Up Google Sheet
1. Create a new Google Sheet. Name it something like **"Phoenix Tech Leads"**.
2. Create the following column headers in the first row (A1 to K1):
   - `Timestamp`
   - `Name`
   - `Company`
   - `Phone`
   - `Email`
   - `City`
   - `Service`
   - `Message`
   - `Budget`
   - `File URL`
   - `Source URL`
3. Freeze the top row so it remains visible (`View > Freeze > 1 Row`).

## Phase 2: Set Up Google Drive Folder
1. Open Google Drive and create a folder named **"Phoenix Technical Leads Uploads"**.
2. Right-click the folder, go to **Share > Share**.
3. Under "General access", set it to **Restricted** (Only people added can open). This ensures only the admin has access to the files.
4. **Copy the Folder ID**: Look at the URL in your browser: `https://drive.google.com/drive/folders/YOUR_FOLDER_ID`. Save `YOUR_FOLDER_ID`.

## Phase 3: Create Google Apps Script
1. Go back to your Google Sheet. Click on **Extensions > Apps Script**.
2. Delete the default `myFunction()` code.
3. Paste the following script:

```javascript
// CONFIGURATION - Update these!
const DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; 
const NOTIFICATION_EMAIL = 'admin@yourcompany.com';
const BUSINESS_NAME = 'Phoenix Technical Solution';

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    let fileUrl = 'No File';
    
    // Handle File Upload to Google Drive
    if (data.fileData && data.fileName && data.fileMime) {
      const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      const decodedFile = Utilities.base64Decode(data.fileData);
      const blob = Utilities.newBlob(decodedFile, data.fileMime, data.fileName);
      const file = folder.createFile(blob);
      fileUrl = file.getUrl();
    }
    
    const timestamp = new Date();
    
    // Append to Google Sheet
    sheet.appendRow([
      timestamp,
      data.name || '',
      data.company || '',
      data.phone || '',
      data.email || '',
      data.city || '',
      data.service || '',
      data.message || '',
      data.budget || '',
      fileUrl,
      data.sourceUrl || ''
    ]);
    
    // Send Email to Admin
    sendAdminEmail(data, fileUrl, timestamp);
    
    // Send Auto-Reply to Customer
    if (data.email) {
      sendCustomerEmail(data.email, data.name);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Enquiry received' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendAdminEmail(data, fileUrl, timestamp) {
  const subject = `New Lead: ${data.name} - ${data.service}`;
  const htmlBody = `
    <h2>New Enquiry Received</h2>
    <table style="border-collapse: collapse; width: 100%;">
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.name}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Company:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.company}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.phone}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>City:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.city}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Service:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.service}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Budget:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.budget}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Message:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.message}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>File:</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="${fileUrl}">${fileUrl !== 'No File' ? 'View Uploaded File' : 'No File'}</a></td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Source URL:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.sourceUrl}</td></tr>
    </table>
  `;
  
  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}

function sendCustomerEmail(email, name) {
  const subject = `Thank You for Your Enquiry - ${BUSINESS_NAME}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #6d1fa0;">Thank You, ${name}!</h2>
      <p>We have received your enquiry and our technical team is currently reviewing your requirements.</p>
      <p>We strive to respond to all enquiries within 24 business hours.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p><strong>${BUSINESS_NAME}</strong></p>
      <p>Email: phoenixtechnical.solution4411@gmail.com</p>
      <p>Phone: +91 94232 39466</p>
    </div>
  `;
  
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: BUSINESS_NAME
  });
}

// Needed to avoid CORS errors for simple OPTIONS pre-flight checks
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
```

4. Replace `YOUR_FOLDER_ID_HERE` with the Google Drive Folder ID.
5. Replace `admin@yourcompany.com` with the actual admin email (e.g. `phoenixtechnical.solution4411@gmail.com`).

## Phase 4: Deploy the Web App
1. Click the blue **Deploy** button on the top right, then select **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill out the details:
   - **Description**: "Enquiry Form Backend"
   - **Execute as**: "Me (your email)"
   - **Who has access**: **"Anyone"** *(CRITICAL: Must be "Anyone", NOT "Anyone with Google Account" so public users can submit).*
4. Click **Deploy**.
5. Google will ask you to authorize access. Click **Authorize access**, select your account, click **Advanced**, and click **Go to Untitled project (unsafe)**. Allow the permissions.
6. Copy the generated **Web app URL** (`https://script.google.com/macros/s/.../exec`).

## Phase 5: Connect Frontend to Backend
1. Open the `enquiry-modal.js` file.
2. Find the line:
   `const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYOUR_SCRIPT_ID_HERE/exec';`
3. Replace the placeholder URL with your actual deployed Web app URL.

## Responsive Behavior Explanation
- **Desktop (500-650px):** The modal opens as a beautifully centered popup with soft shadows and a glassmorphism backdrop. The inputs are arranged using CSS Grid (2 columns) to optimize space.
- **Mobile (95vw):** The modal scales down to take up almost the full width of the screen. The CSS grid automatically collapses into a single column (`grid-template-columns: 1fr;`), stacking all input fields vertically. Padding is reduced to maximize readability.
- **Scroll Lock:** When the modal is open, `document.body.style.overflow = 'hidden'` is applied to prevent the background page from scrolling while the user interacts with the form.
