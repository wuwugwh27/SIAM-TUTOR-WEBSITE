# Siam Tutor Website (নবম-দশম শ্রেণির গণিত গৃহশিক্ষক • মানিকগঞ্জ)

Official website for **Siam Tutor** (Siam Hossain) offering responsible home tuition for General and Higher Mathematics for Class 9 & 10 students in Manikganj Sadar and surrounding areas.

---

## 🚀 Live Vercel Deployment

This project is configured for **1-click zero-config deployment on [Vercel](https://vercel.com/)**:

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import the GitHub repository: `https://github.com/wuwugwh27/SIAM-TUTOR-WEBSITE`.
3. Keep default settings (Framework Preset: **Other**, Root Directory: `./`).
4. Click **Deploy**. Your website will be live with free SSL and global CDN in under 30 seconds!

---

## ✨ Features

- **Responsive & Accessible**: Fully responsive across mobile, tablet, and desktop viewports with 0 horizontal overflow.
- **Direct Phone & WhatsApp Integration**:
  - One-tap mobile dialer link (`tel:+8801604546974`).
  - One-click direct WhatsApp chat link (`https://wa.me/8801604546974`).
  - Clean action labels without visual clutter.
- **SEO & Schema.org**: Fully indexed metadata with OpenGraph, Twitter Cards, and EducationalOrganization Schema.org JSON-LD structured data.
- **Tuition Booking & Inquiry Form**: Client-side validation for Bangladeshi phone numbers (`01[3-9]...`) with confirmation dialog.
- **Vanilla Tech Stack**: High performance pure HTML5, Vanilla CSS design tokens, and modular JavaScript without heavy dependencies.

---

## 📁 Project Structure

```
.
├── assets/
│   └── images/              # High-quality photography assets
│       ├── about-siam.jpg
│       ├── avatar-siam.jpg
│       ├── hero-siam.jpg
│       ├── study-notebook.jpg
│       └── teaching-whiteboard.jpg
├── index.html               # Main website markup & semantic structure
├── styles.css               # Production stylesheet & design tokens
├── script.js                # Centralized configuration & interactive logic
├── vercel.json              # Vercel deployment configuration & security headers
├── package.json             # Project metadata
├── server.ps1               # Local HTTP server for testing
├── run_full_test_suite.ps1  # Automated test suite (CDP headless)
└── README.md                # Documentation & deployment guide
```

---

## 💻 Local Development

To run the site locally on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

Then visit: [http://localhost:8080/](http://localhost:8080/)
