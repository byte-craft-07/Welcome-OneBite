# Standalone Business Link Hub

A completely standalone, production-ready **Business Link Hub** website, digital business card, and link-in-bio platform with a full-featured Admin Panel, MongoDB database, dynamic theme customizer, real-time operating hours calculator, and vector QR Code marketing studio.

---

## 🌟 Key Highlights

* **100% Standalone & Independent**: Zero external dependencies, no connection to legacy codebases. Multi-business ready schema.
* **Instant Quick Owner Access (PIN: `753753`)**: A discreet button at the bottom of the public page allows the business owner to enter `753753` on a mobile keypad to instantly unlock full admin dashboard control without typing long email/passwords!
* **Full CRUD Admin Control**: Add, live-edit, duplicate, delete, and drag-and-drop reorder links without writing a single line of code.
* **Real-Time Operating Hours & Status**: Automatically calculates `● Open Now` (with closing time) or `● Closed` (with next opening time) based on the business's timezone (default `Asia/Kolkata`).
* **WhatsApp Auto-Triggering**: Converts WhatsApp phone numbers and pre-filled greeting messages directly into `https://wa.me/` URLs.
* **Theme & Appearance Engine**: 8 presets (Bakery Warm, Classic Indigo, Clean Minimal, Midnight Dark, Emerald Luxe, Rose Modern, Lavender Soft, Cyberpunk Neon), custom hex color pickers, button shapes, and a real-time mobile preview simulator.
* **High-Resolution QR Code Studio**: Instant PNG (print resolution) and SVG vector downloads, plus printable table tent/stand previews.
* **Privacy-Friendly Analytics**: Tracks page views, unique visitors, link click counts, device distribution (mobile vs desktop), and click-through rates.
* **PWA & Mobile-First**: Responsive across 320px up to 4K desktop screens, with offline-ready manifest and Web Share API fallback.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 6, Tailwind CSS, Lucide Icons, React Router 6 |
| **Backend** | Node.js, Express, TypeScript, Helmet, Express Rate Limit, Multer |
| **Database** | MongoDB, Mongoose 8 (Full multi-business relational document schema) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password & PIN hashing |
| **Validation** | Zod schema validation (URL protocol sanitization, slug validation) |
| **Utilities** | QRCode (PNG & SVG generation), crypto IP anonymizer |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **MongoDB**: Running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

### 1. Installation
Install dependencies for both frontend and backend:
```bash
npm run install:all
```
*(or `npm install` inside both `./backend` and `./frontend`)*

### 2. Environment Configuration
The backend comes pre-configured with a default `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/business_link_hub
JWT_SECRET=super_secret_jwt_key_business_link_hub_2026_standalone
ADMIN_PIN=753753
CLIENT_URL=http://localhost:5173
PUBLIC_URL=http://localhost:5173
```

### 3. Database Seeding
Populate the database with the default admin and the demonstration business (**OneBite Bakery**):
```bash
npm run seed
```

### 4. Running the Development Servers
In separate terminals (or concurrently):
```bash
# Terminal 1: Backend API (runs on http://localhost:5000)
npm run dev:backend

# Terminal 2: Frontend (runs on http://localhost:5173)
npm run dev:frontend
```

---

## 🔐 Admin Access Credentials

You can log in to the admin panel using either of these two methods:

### Method 1: Bottom-of-Page Quick Passcode (Recommended)
1. Open the public business page: [http://localhost:5173/onebite-bakery](http://localhost:5173/onebite-bakery)
2. Scroll to the bottom of the page and click the **"Admin Access"** button
3. Enter the 6-digit passcode:
   ```text
   753753
   ```
4. The dashboard unlocks immediately!

### Method 2: Standard Email & Password
* **URL**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
* **Email**: `admin@businesslinkhub.local`
* **Password**: `admin123456`

---

## 🧪 Automated Testing

Run the end-to-end integration test suite verifying 21 critical checkpoints:
```bash
npm run test
```

Tests include:
* ✅ API Health check
* ✅ Public business profile retrieval
* ✅ Automatic real-time business hours open/closed computation
* ✅ Safe URL and slug validation
* ✅ Public page view tracking & link click tracking
* ✅ High-resolution QR code PNG & SVG generation
* ✅ Admin PIN `753753` verification & JWT generation
* ✅ Email and password authentication
* ✅ Protected route authorization & 401 enforcement
* ✅ Link CRUD operations (create, update, reorder, duplicate, delete)
* ✅ Analytics summary aggregation

---

## 📂 Project Structure

```text
welcome page/
├── backend/
│   ├── src/
│   │   ├── config/         # MongoDB Mongoose connection
│   │   ├── controllers/    # Business, Link, Hours, Appearance, QR, Analytics
│   │   ├── middleware/     # JWT Auth, Multer file upload
│   │   ├── models/         # User, Business, BusinessLink, BusinessHours, BusinessAppearance
│   │   ├── routes/         # /api/public, /api/admin, /api/auth
│   │   ├── utils/          # Seed script, test runner, business hours calculator
│   │   ├── validators/     # Zod validation schemas
│   │   └── server.ts       # Express application entry point
│   ├── uploads/            # Uploaded images (logos, covers)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # AdminLayout, IconRenderer, AdminQuickAccessModal, ConfirmModal, Toast
│   │   ├── context/        # AuthContext, ToastContext
│   │   ├── pages/          # PublicBusinessPage, AdminDashboard, AdminProfile, AdminLinks,
│   │   │                   # AdminHours, AdminAppearance, AdminQR, AdminAnalytics, AdminLogin
│   │   ├── services/       # Typed API client
│   │   ├── types/          # Full TypeScript interfaces
│   │   ├── App.tsx         # Route definitions
│   │   └── main.tsx        # React entry point
│   ├── public/             # PWA manifest, favicon
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── package.json            # Root workspace scripts
└── README.md
```

---

## 🌐 API Overview

### Public APIs (No authentication required)
* `GET /api/public/business/:slug` — Retrieve public business profile, active links, hours & appearance
* `POST /api/public/business/:slug/view` — Record page view
* `POST /api/public/business/:slug/links/:linkId/click` — Record link click (non-blocking)
* `GET /api/public/business/:slug/qr` — Generate QR code in PNG or SVG format

### Authentication APIs
* `POST /api/auth/pin-login` — Authenticate using PIN `753753`
* `POST /api/auth/login` — Authenticate using email & password
* `GET /api/auth/me` — Get current user & business associations
* `PUT /api/auth/pin` — Update the quick PIN passcode

### Admin APIs (Bearer JWT required)
* `GET /api/admin/businesses` & `POST /api/admin/businesses` — Manage businesses
* `GET /api/admin/business` & `PUT /api/admin/business` — Update business profile details
* `GET /api/admin/links` — List all links
* `POST /api/admin/links` — Create new link
* `PUT /api/admin/links/reorder` — Reorder links array
* `PUT /api/admin/links/:id` — Update link
* `DELETE /api/admin/links/:id` — Delete link
* `POST /api/admin/links/:id/duplicate` — Duplicate link
* `PATCH /api/admin/links/:id/toggle` — Toggle active/inactive
* `GET /api/admin/hours` & `PUT /api/admin/hours` — Update operating schedule
* `GET /api/admin/appearance` & `PUT /api/admin/appearance` — Update visual theme & styles
* `GET /api/admin/analytics` — Aggregate page view and click statistics
* `POST /api/admin/upload` — Upload business logo, cover, or link images
