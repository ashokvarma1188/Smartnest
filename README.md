<div align="center">

<h1>🏠 SmartNest</h1>

<p>A full-stack real estate platform where owners list properties and buyers find their dream home — <strong>no broker, no commission.</strong></p>

[![Live Demo](https://img.shields.io/badge/🔗_Live_Demo-Visit_Site-C98A35?style=for-the-badge)](https://smartnest-2zw0.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 JWT Auth | Secure login & registration with token-based auth |
| 🔵 Google OAuth 2.0 | One-click sign-in with Google via Passport.js |
| 📧 OTP Password Reset | 6-digit OTP sent to email using Resend API |
| 🏡 Property Listings | Owners add, edit, delete listings with up to 8 images |
| 🔍 Search & Filter | Filter by location, price range, and bedrooms |
| ❤️ Save Properties | Buyers save favourite properties locally |
| 🖼️ Image Gallery | Full gallery with thumbnail navigation on detail page |
| 👥 Role-Based Access | Separate dashboards for Owners and Buyers |
| 📱 Responsive | Works on mobile and desktop |

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="33%">

### Frontend
- HTML5, CSS3
- Vanilla JavaScript
- Google Fonts
- (Fraunces + Space Grotesk)

</td>
<td valign="top" width="33%">

### Backend
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT + bcryptjs
- Passport.js (Google OAuth)
- Multer (image uploads)
- Resend API (OTP emails)

</td>
<td valign="top" width="33%">

### Deployment
- Backend → Render
- Database → MongoDB Atlas
- Auth → Google Cloud Console
- Email → Resend

</td>
</tr>
</table>

---

## 📁 Project Structure

```
SmartNest/
│
├── 📂 frontend/
│   ├── 📄 index.html               ← Landing page
│   ├── 📄 login.html               ← Login
│   ├── 📄 register.html            ← Register
│   ├── 📄 browse-properties.html   ← Buyer dashboard
│   ├── 📄 add-property.html        ← Owner dashboard
│   ├── 📄 property-detail.html     ← Property detail + gallery
│   ├── 📄 profile.html             ← User profile
│   ├── 📄 forgot-password.html     ← OTP password reset
│   ├── 📂 css/                     ← Separate CSS per page
│   └── 📂 js/                      ← Separate JS per page
│
└── 📂 server/
    ├── 📂 controllers/             ← Business logic
    ├── 📂 models/                  ← MongoDB schemas
    ├── 📂 routes/                  ← API endpoints
    ├── 📂 middleware/              ← Auth middleware
    ├── 📂 config/                  ← DB + Passport config
    └── 📂 uploads/                 ← Uploaded property images
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/send-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/reset-password` | Set new password |

### Properties
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/property/all` | No | Get all properties |
| GET | `/api/property/:id` | No | Get single property |
| POST | `/api/property/add` | Owner | Add new property |
| PUT | `/api/property/:id` | Owner | Update property |
| DELETE | `/api/property/:id` | Owner | Delete property |

---

## 🔄 How It Works

**Login / Auth Flow:**

```
User Registers / Logs In
        ↓
Server verifies credentials → creates JWT token
        ↓
Token stored in localStorage
        ↓
Every API request sends token in Authorization header
        ↓
Server middleware verifies token → allows or rejects
```

**Forgot Password (OTP Flow):**

```
User enters email → Server generates 6-digit OTP
        ↓
OTP sent via Resend API (HTTP, not SMTP)
        ↓
User enters OTP → Server verifies match + expiry
        ↓
User sets new password → saved as bcrypt hash
```

---

## 🚀 Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/ashokvarma1188/Smartnest.git

# 2. Install dependencies
cd server
npm install

# 3. Create server/.env file
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
RESEND_API_KEY=your_resend_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret

# 4. Start the server
npm start
```

> Frontend is plain HTML — open any `.html` file in browser or use **Live Server** extension in VS Code.

---

## 📌 Pages Overview

| Page | Role | What it does |
|---|---|---|
| `/index.html` | Everyone | Landing page with featured listings |
| `/register.html` | Everyone | Create account as Owner or Buyer |
| `/login.html` | Everyone | Login with email or Google |
| `/browse-properties.html` | Buyer | Browse, search, filter, save properties |
| `/add-property.html` | Owner | Add, edit, delete your listings |
| `/property-detail.html` | Everyone | Full property view + contact owner |
| `/profile.html` | Logged in | View profile + change password |
| `/forgot-password.html` | Everyone | Reset password via OTP |

---

## 💡 Real Problem I Solved During Development

> While deploying on Render, OTP emails stopped working. After checking the logs, I found that **Render's free plan blocks all SMTP ports (465 and 587)**. I was using Nodemailer with Gmail SMTP. I researched alternatives and switched to **Resend API** which uses HTTP instead of SMTP — this fixed the issue completely.

---

<div align="center">

### Built with ❤️ by Ashok Varma

*Final Year Student | Full Stack Developer*

[![GitHub](https://img.shields.io/badge/GitHub-ashokvarma1188-181717?style=for-the-badge&logo=github)](https://github.com/ashokvarma1188)

</div>
