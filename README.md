# Nxt Stock — Coaching Performance Marketing Website

Single-page marketing site for **Nxt Stock** (performance marketing for coaching businesses).

## Preview locally

```bash
cd "/Users/parveshjangra/Code/Nxt Stock"
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080)

## Connect form to Google Sheets

1. Create a [Google Sheet](https://sheets.google.com) with a tab named **Leads**.
2. Add headers in row 1:

   `Timestamp | Name | Phone | Email | City | Coaching Type | Niche | Monthly Revenue | Message | Source`

3. **Extensions → Apps Script** — paste code from `google-apps-script/Code.gs`.
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the **Web App URL** into `config.js`:

   ```js
   GOOGLE_SHEET_WEB_APP_URL: "https://script.google.com/macros/s/....../exec",
   ```

6. Submit a test lead from the hero form and confirm a new row appears.

> `mode: "no-cors"` is used so the form works from any domain without CORS errors. The browser won’t show the JSON response, but rows still append if the script is deployed correctly.

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
