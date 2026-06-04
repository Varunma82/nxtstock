/**
 * Nxt Stock — Lead form → Google Sheet
 *
 * Setup:
 * 1. Create a Google Sheet with headers in row 1:
 *    Timestamp | Name | Phone | Email | City | Coaching Type | Niche | Monthly Revenue | Message | Source
 * 2. Extensions → Apps Script → paste this file
 * 3. Set SHEET_NAME below if your tab name differs
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL into config.js → GOOGLE_SHEET_WEB_APP_URL
 */

const SHEET_NAME = "Leads";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({ ok: false, error: "Sheet not found: " + SHEET_NAME });
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || "",
      data.phone || "",
      data.email || "",
      data.city || "",
      data.coachingType || "",
      data.niche || "",
      data.monthlyRevenue || "",
      data.message || "",
      data.source || "Website",
    ]);

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
