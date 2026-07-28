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

const EMAIL_TO = "varumahesh82y@gmail.com"; // Email address where form responses will be sent

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Handle completed purchases
    if (data.type === "purchase") {
      // 1. Send confirmation email to the buyer (customer)
      if (data.email) {
        const buyerSubject = "Order Confirmed: Your Habit Tracker is on the way!";
        const buyerBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4A0E4E; margin-top: 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; text-align: center;">Order Confirmed!</h2>
            <p>Dear Customer,</p>
            <p>Thank you for purchasing the <strong>Habit Tracker (${data.tierLabel})</strong>. We have successfully received your payment.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px dashed #4A0E4E;">
              <h3 style="margin-top: 0; color: #4A0E4E;">Delivery Information</h3>
              <p style="font-size: 16px; margin: 5px 0;"><strong>We will deliver the product files directly to this email address (${data.email}) within 3 hours.</strong></p>
            </div>
            <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Item:</strong></td>
                <td style="padding: 8px 0; text-align: right; color: #333;">Habit Tracker (${data.tierLabel})</td>
              </tr>
              ${data.addons ? `
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Add-ons:</strong></td>
                <td style="padding: 8px 0; text-align: right; color: #333;">${data.addons}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 16px;"><strong>Total Paid:</strong></td>
                <td style="padding: 8px 0; text-align: right; color: #4A0E4E; font-size: 18px; font-weight: bold;">₹${data.amount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #999; font-size: 11px;"><strong>Payment ID:</strong></td>
                <td style="padding: 8px 0; text-align: right; color: #999; font-size: 11px;">${data.paymentId}</td>
              </tr>
            </table>
            <br>
            <p style="font-size: 14px; color: #666;">If you have any questions or do not receive your tracker files within 3 hours, please reply directly to this email or write to us at <a href="mailto:hr@nxtstock.in" style="color: #a855f7;">hr@nxtstock.in</a>.</p>
            <p style="margin-top: 25px; border-top: 1px solid #f0f0f0; padding-top: 15px; font-size: 14px; color: #888; text-align: center;">© 2026 NxtStockStore. All rights reserved.</p>
          </div>
        `;
        MailApp.sendEmail({
          to: data.email,
          subject: buyerSubject,
          htmlBody: buyerBody
        });
      }

      // 2. Send transaction alert email to the site owner (admin)
      if (EMAIL_TO) {
        const ownerSubject = "💰 New Purchase Alert! - ₹" + data.amount;
        const ownerBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #10B981; margin-top: 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">New Purchase Completed!</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Email</td>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;"><a href="mailto:${data.email}">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Phone</td>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${data.phone || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Selected Package</td>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${data.tierLabel}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Addons</td>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${data.addons || 'None'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Total Amount</td>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333; font-weight: bold; color: #10B981;">₹${data.amount}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Razorpay Payment ID</td>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${data.paymentId}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Time</td>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #777;">${data.timestamp || new Date().toISOString()}</td>
              </tr>
            </table>
          </div>
        `;
        MailApp.sendEmail({
          to: EMAIL_TO,
          subject: ownerSubject,
          htmlBody: ownerBody
        });
      }

      return jsonResponse({ ok: true });
    }

    // Default leads handler
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
