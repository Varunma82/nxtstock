# Nxt Stock — Coaching Performance Marketing Website

Single-page marketing site for **Nxt Stock** (performance marketing for coaching businesses).

## Preview locally

```bash
cd "/Users/parveshjangra/Code/Nxt Stock"
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080)

## Connect form to Email Notifications (via Google Apps Script)

1. Open your Google Sheet or a standalone Apps Script project.
2. **Extensions → Apps Script** — paste the code from [Code.gs](file:///Users/varun/Downloads/Nxt%20Stock/google-apps-script/Code.gs).
   - *Note:* The recipient email is configured in `Code.gs` via the `EMAIL_TO` constant (`parvesh0326@gmail.com`). You can change this to any email you prefer.
3. **Deploy → New deployment → Web app**
   - Execute as: **Me** (this is required so the script can send emails on your behalf)
   - Who has access: **Anyone**
4. Copy the **Web App URL** into [config.js](file:///Users/varun/Downloads/Nxt%20Stock/config.js):

   ```js
   GOOGLE_SHEET_WEB_APP_URL: "https://script.google.com/macros/s/....../exec",
   ```

5. Submit a test lead from the hero form. The submission will:
   - Send an email notification with all the lead details to **parvesh0326@gmail.com**.

> `mode: "no-cors"` is used so the form works from any domain without CORS errors. The browser won’t show the JSON response, but emails are sent if the script is deployed correctly.

## Customize

| Item | Where |
|------|--------|
| Client logos | Replace files in `assets/logos/` (use PNG/SVG, ~140×48px) |
| Testimonial videos | Edit YouTube iframe `src` in `index.html` → Success Stories |
| Google Sheet URL | `config.js` |
| Copy / contact | `index.html` |

## Deploy

Upload the folder to **Netlify**, **Vercel**, **GitHub Pages**, or any static host. No build step required.

## Contact (on site)

- **Parvesh Jangra**
- parvesh0326@gmail.com · bussinessx@nxtstock.in
- +91 95309 96291
