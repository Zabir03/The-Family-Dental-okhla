# The Family Dental Okhla — website

Plain HTML, CSS and JavaScript. No build step, no frameworks, no libraries.
Upload the three files to any host (Hostinger, Netlify, GitHub Pages, cPanel) and it runs.

```
index.html     ← the whole site (HTML + CSS + JS in one file)
robots.txt
sitemap.xml
```

---

## Before you go live — 5 things to change

**1. Your domain (7 places)**
Find and replace `https://example.com` with your real domain in `index.html` **and** in `robots.txt` and `sitemap.xml`. It appears in the canonical tag, Open Graph tags, Twitter tags and both JSON-LD blocks.

**2. Connect the appointment form** — *currently the form does not send anything anywhere*
Open `index.html`, find this line near the bottom:

```js
var FORM_ENDPOINT = "";
```

Paste in a form endpoint URL. The easiest free option is [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) — sign up, create a form, paste the URL:

```js
var FORM_ENDPOINT = "https://formspree.io/f/abcdxyz";
```

Until you do this, the form validates and shows the success message but **no email reaches the clinic**. Test it once with your own phone number before launch.

**3. Real photos**
There are two photo slots (hero, About section) currently filled with abstract SVG placeholders. Each one has a comment above it showing the exact markup to paste in. Search for `PHOTO SLOT`. Use real photos of the clinic, reception or treatment room — not stock cartoons.

Export each photo at roughly 1200×900, save as `.webp`, keep the `width`, `height` and `alt` attributes so the page doesn't jump while loading.

**4. Exact map pin**
The "Load map" button currently searches Google Maps by address. For an exact pin, open your Google Business Profile → Share → **Embed a map**, copy the `src` URL from the code Google gives you, and replace the `f.src = ...` line in the map script.

**5. Google reviews link**
The "Read reviews on Google" button uses a search URL. Replace it with your Google Business Profile review link (`https://g.page/r/...`) for a direct jump.

---

## What I deliberately left out

Following your brief, nothing was invented. There are **no** doctor names, qualifications, years of experience, patient counts, awards, prices, testimonials, email addresses or social links anywhere in the code.

One more: the `aggregateRating` (4.9 / 283) is shown on the page but is **not** in the Schema.org markup. Google's structured-data policy treats a business marking up its own rating as self-serving, and it can trigger a manual action. The rating still displays and still links to Google — that's the safe way to do it.

Add social icons later by pasting them into the footer where the comment says so.

---

## Good to know

- **"Open now / Closed" is calculated in Asia/Kolkata time**, so a visitor in Dubai or London still sees the clinic's real status. It refreshes every minute.
- **The opening-hours bar chart** in the Hours section is drawn from one config object (`HOURS`) at the top of the script. Change the timings there and the chart, the status badge and the highlighted "today" row all update together. The written times in the HTML need updating separately.
- **Spam protection** is a hidden honeypot field plus a 3-second minimum before submission. Both silently swallow bot submissions.
- **The map iframe loads only when clicked.** Third-party iframes are the single biggest drag on a Lighthouse score, so this keeps the page fast.
- **Clicking "Ask about this"** on any treatment card jumps to the form and pre-selects that treatment.
- Reduced motion is respected, all interactive elements are keyboard reachable, and focus outlines are visible.

## After launch

1. Submit the sitemap in Google Search Console.
2. Test the page in [PageSpeed Insights](https://pagespeed.web.dev) — check the mobile tab.
3. Validate the structured data at [validator.schema.org](https://validator.schema.org).
4. Make sure the website URL is added to the Google Business Profile — for local ranking this matters more than anything on the page itself.
