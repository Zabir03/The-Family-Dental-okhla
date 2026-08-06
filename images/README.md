# Photos to add here

The site now points to real `<img>` tags instead of the placeholder SVG graphics. Drop your photos into this folder using these exact filenames and the page will pick them up automatically — no other changes needed.

## 1. Hero photo (top of homepage, first thing visitors see)

- `clinic-hero.jpg` — required (fallback, works everywhere)
- `clinic-hero.webp` — optional but recommended (smaller file size)
- `clinic-hero.avif` — optional but recommended (smallest file size)

Suggested shot: reception area, treatment room, or the dentist with a patient. Landscape orientation, roughly **1600×1200px** (4:3 ratio) or larger — it gets scaled down responsively.

## 2. About-section photo (clinic interior, further down the page)

- `clinic-interior.jpg` — required
- `clinic-interior.webp` — optional
- `clinic-interior.avif` — optional

Suggested shot: a different angle of the clinic interior (waiting area, another treatment room). Same size guidance as above.

## Notes

- If you only have `.jpg` files, that's fine — just delete the two `<source srcset="...avif">` / `<source srcset="...webp">` lines for that photo in `index.html` so the browser isn't sent to a file that doesn't exist (browsers don't automatically fall back to the next `<source>` on a 404). Otherwise, supply all three formats.
- Keep individual file sizes under ~300KB for fast loading (compress with [squoosh.app](https://squoosh.app) if needed).
- Use real, high-resolution photos of the actual clinic — no stock or AI-generated images — for the best trust signal with patients.
- Once real photos are in place, also update `og:image` / `twitter:image` in `index.html` (currently pointing at `https://example.com/images/clinic-cover.jpg`) to a real hosted image URL for link previews.
