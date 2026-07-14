/**
 * Nxt Stock — Lead form → Email Notification
 *
 * Setup:
 * 1. Open your Google Sheet, click Extensions → Apps Script (or create a standalone Apps Script project)
 * 2. Paste this file contents
 * 3. Click the Save icon
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me (your Google Account)
 *    - Who has access: Anyone
 * 5. Copy the Web App URL into config.js → GOOGLE_SHEET_WEB_APP_URL
 */

const EMAIL_TO = "parvesh0326@gmail.com"; // Email address where form responses will be sent

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Send email notification with lead details
    if (EMAIL_TO) {
      const emailSubject = "New Lead from Nxt Stock: " + (data.name || "Anonymous");
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4A154B; margin-top: 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">New Lead Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555; width: 140px;">Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${data.name || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Phone</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${data.phone || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Email</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;"><a href="mailto:${data.email || ""}" style="color: #1a73e8; text-decoration: none;">${data.email || "N/A"}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">City</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${data.city || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Coaching Type</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${data.coachingType || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Niche</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${data.niche || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Source</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${data.source || "Website"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Timestamp</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #777; font-size: 12px;">${data.timestamp || new Date().toISOString()}</td>
            </tr>
          </table>
        </div>
      `;

      MailApp.sendEmail({
        to: EMAIL_TO,
        subject: emailSubject,
        htmlBody: emailBody
      });
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput("Nxt Stock lead endpoint is running.");
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
