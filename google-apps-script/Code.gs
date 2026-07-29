/**
 * Nxt Stock — Lead form & Payment Integration
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

const EMAIL_TO = "varumahesh82y@gmail.com"; // Email address where notifications will be sent

// Cashfree Production Credentials
const CASHFREE_APP_ID = "1352243daf306e1276911f673663422531";
const CASHFREE_SECRET_KEY = "YOUR_CASHFREE_SECRET_KEY"; // Enter your live secret key in the online Apps Script editor
const CASHFREE_URL = "https://api.cashfree.com/pg/orders";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // 1. Action: Create Cashfree Order Session
    if (data.type === "create_cashfree_order") {
      const orderId = "order_" + Math.floor(Math.random() * 10000000) + "_" + new Date().getTime();
      const payload = {
        order_amount: Number(data.amount),
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
          customer_id: "cust_" + Math.floor(Math.random() * 1000000),
          customer_name: data.name || "Customer",
          customer_email: data.email || "customer@example.com",
          customer_phone: data.phone || "9999999999"
        },
        order_tags: {
          tierLabel: data.tierLabel || "Access",
          addons: data.addons || "None"
        },
        order_meta: {
          return_url: data.return_url
        }
      };

      const options = {
        method: "post",
        contentType: "application/json",
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01"
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };

      const response = UrlFetchApp.fetch(CASHFREE_URL, options);
      const responseText = response.getContentText();
      const responseData = JSON.parse(responseText);

      if (response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
        return jsonResponse({
          ok: true,
          payment_session_id: responseData.payment_session_id,
          order_id: responseData.order_id
        });
      } else {
        return jsonResponse({
          ok: false,
          error: responseData.message || responseText
        });
      }
    }

    // 2. Action: Verify Cashfree Order Status (after redirect callback)
    if (data.type === "check_cashfree_order") {
      const scriptProperties = PropertiesService.getScriptProperties();
      const processedKey = "cf_processed_" + data.order_id;
      const alreadyProcessed = scriptProperties.getProperty(processedKey);

      if (alreadyProcessed === "true") {
        // Retrieve stored order info to confirm success to frontend
        const savedEmail = scriptProperties.getProperty("cf_email_" + data.order_id) || "";
        return jsonResponse({
          ok: true,
          status: "PAID",
          alreadyProcessed: true,
          email: savedEmail
        });
      }

      const checkUrl = CASHFREE_URL + "/" + encodeURIComponent(data.order_id);
      const checkOptions = {
        method: "get",
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01"
        },
        muteHttpExceptions: true
      };

      const checkResponse = UrlFetchApp.fetch(checkUrl, checkOptions);
      const checkResponseText = checkResponse.getContentText();
      const checkResponseData = JSON.parse(checkResponseText);

      if (checkResponse.getResponseCode() >= 200 && checkResponse.getResponseCode() < 300) {
        if (checkResponseData.order_status === "PAID") {
          // Prevent double processing/email alerts
          scriptProperties.setProperty(processedKey, "true");
          
          const email = checkResponseData.customer_details ? checkResponseData.customer_details.customer_email : "";
          const phone = checkResponseData.customer_details ? checkResponseData.customer_details.customer_phone : "";
          const amount = checkResponseData.order_amount;
          
          const tierLabel = checkResponseData.order_tags ? checkResponseData.order_tags.tierLabel : "Lifetime Access";
          const addonsText = checkResponseData.order_tags ? checkResponseData.order_tags.addons : "None";

          if (email) {
            scriptProperties.setProperty("cf_email_" + data.order_id, email);
          }

          // 1. Send confirmation email to the buyer
          if (email) {
            sendBuyerConfirmationEmail(email, tierLabel, addonsText, amount, data.order_id);
          }

          // 2. Send email alert to owner
          if (EMAIL_TO) {
            sendOwnerAlertEmail(email, phone, tierLabel, addonsText, amount, data.order_id, "Cashfree");
          }

          return jsonResponse({
            ok: true,
            status: "PAID",
            email: email
          });
        } else {
          return jsonResponse({
            ok: true,
            status: checkResponseData.order_status
          });
        }
      } else {
        return jsonResponse({
          ok: false,
          error: checkResponseData.message || checkResponseText
        });
      }
    }

    // 3. Action: Handle Completed Razorpay Purchase (backward compatibility)
    if (data.type === "purchase") {
      if (data.email) {
        sendBuyerConfirmationEmail(data.email, data.tierLabel, data.addons, data.amount, data.paymentId);
      }
      if (EMAIL_TO) {
        sendOwnerAlertEmail(data.email, data.phone, data.tierLabel, data.addons, data.amount, data.paymentId, "Razorpay");
      }
      return jsonResponse({ ok: true });
    }

    // 4. Default: Handle Leads Submission
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

function sendBuyerConfirmationEmail(email, tierLabel, addonsText, amount, paymentId) {
  const buyerSubject = "Order Confirmed: Your Habit Tracker is on the way!";
  const buyerBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #4A0E4E; margin-top: 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; text-align: center;">Order Confirmed!</h2>
      <p>Dear Customer,</p>
      <p>Thank you for purchasing the <strong>Habit Tracker (${tierLabel})</strong>. We have successfully received your payment.</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px dashed #4A0E4E;">
        <h3 style="margin-top: 0; color: #4A0E4E;">Delivery Information</h3>
        <p style="font-size: 16px; margin: 5px 0;"><strong>We will deliver the product files directly to this email address (${email}) within 3 hours.</strong></p>
      </div>
      <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Item:</strong></td>
          <td style="padding: 8px 0; text-align: right; color: #333;">Habit Tracker (${tierLabel})</td>
        </tr>
        ${addonsText ? `
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Add-ons:</strong></td>
          <td style="padding: 8px 0; text-align: right; color: #333;">${addonsText}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 0; color: #666; font-size: 16px;"><strong>Total Paid:</strong></td>
          <td style="padding: 8px 0; text-align: right; color: #4A0E4E; font-size: 18px; font-weight: bold;">₹${amount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #999; font-size: 11px;"><strong>Payment ID:</strong></td>
          <td style="padding: 8px 0; text-align: right; color: #999; font-size: 11px;">${paymentId}</td>
        </tr>
      </table>
      <br>
      <p style="font-size: 14px; color: #666;">If you have any questions or do not receive your tracker files within 3 hours, please reply directly to this email or write to us at <a href="mailto:hr@nxtstock.in" style="color: #a855f7;">hr@nxtstock.in</a>.</p>
      <p style="margin-top: 25px; border-top: 1px solid #f0f0f0; padding-top: 15px; font-size: 14px; color: #888; text-align: center;">© 2026 NxtStockStore. All rights reserved.</p>
    </div>
  `;
  MailApp.sendEmail({
    to: email,
    subject: buyerSubject,
    htmlBody: buyerBody
  });
}

function sendOwnerAlertEmail(email, phone, tierLabel, addonsText, amount, paymentId, gateway) {
  const gwLabel = gateway || "Razorpay";
  const ownerSubject = "💰 New Purchase Alert! [" + gwLabel + "] - ₹" + amount;
  const ownerBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #10B981; margin-top: 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">New Purchase Completed (${gwLabel})!</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Email</td>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Phone</td>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${phone || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Selected Package</td>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${tierLabel}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Addons</td>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${addonsText || 'None'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Total Amount</td>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333; font-weight: bold; color: #10B981;">₹${amount}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">${gwLabel} Payment ID</td>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${paymentId}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Time</td>
          <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #777;">${new Date().toISOString()}</td>
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

function doGet(e) {
  return ContentService.createTextOutput("Nxt Stock lead & payment endpoint is running.");
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// Run this function directly in the Apps Script editor to force the Google authorization popup
function triggerAuthorization() {
  UrlFetchApp.fetch("https://sandbox.cashfree.com/pg/orders", {
    muteHttpExceptions: true
  });
}
