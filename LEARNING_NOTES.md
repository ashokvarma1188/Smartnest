# SmartNest — Complete Learning Notes

Everything I built, every file explained, every concept learned.

---

## PART 1 — FOLDER & FILE STRUCTURE

```
SmartNest/
│
├── frontend/                  ← All pages user sees in browser
│   ├── index.html             ← Landing page (home)
│   ├── login.html             ← Login page
│   ├── register.html          ← Register page
│   ├── browse-properties.html ← Buyer sees all properties
│   ├── add-property.html      ← Owner adds/edits/deletes properties
│   ├── property-detail.html   ← Single property full view + gallery
│   ├── profile.html           ← User profile + change password
│   ├── forgot-password.html   ← OTP password reset (3 steps)
│   ├── auth-callback.html     ← Google OAuth lands here after login
│   │
│   ├── css/                   ← Styles for each page (separate file per page)
│   │   ├── index.css
│   │   ├── login.css
│   │   ├── register.css
│   │   ├── browse-properties.css
│   │   ├── add-property.css
│   │   ├── property-detail.css
│   │   ├── profile.css
│   │   ├── forgot-password.css
│   │   ├── auth-callback.css
│   │   └── style.css          ← Shared styles used across all pages
│   │
│   └── js/                    ← Logic for each page (separate file per page)
│       ├── index.js           ← Landing page logic
│       ├── login.js           ← Login form submit, token save
│       ├── register.js        ← Register form submit
│       ├── browse-properties.js ← Fetch & display all properties, filter
│       ├── add-property.js    ← Add/edit/delete property, image upload
│       ├── property-detail.js ← Show single property + gallery
│       ├── profile.js         ← Show user info, change password
│       ├── forgot-password.js ← 3-step OTP flow
│       ├── auth-callback.js   ← Save Google OAuth token, redirect by role
│       ├── app.js             ← Shared functions used across pages
│       └── toast.js           ← Toast notification popup
│
└── server/                    ← Backend (Node.js + Express)
    ├── server.js              ← Starting point — creates app, connects everything
    │
    ├── config/
    │   ├── db.js              ← Connects to MongoDB Atlas
    │   └── passport.js        ← Google OAuth setup
    │
    ├── models/
    │   ├── user.js            ← User data structure (schema)
    │   └── property.js        ← Property data structure (schema)
    │
    ├── controllers/
    │   ├── authController.js  ← Register, Login, OTP logic
    │   └── propertyController.js ← Add, Edit, Delete, Get properties
    │
    ├── middleware/
    │   └── authMiddleware.js  ← Checks JWT token before allowing access
    │
    ├── routes/
    │   ├── authRoutes.js      ← Auth API endpoints (/register, /login, /send-otp...)
    │   ├── propertyRoutes.js  ← Property API endpoints (/add, /all, /delete...)
    │   ├── googleAuthRoutes.js ← Google OAuth routes
    │   └── testRoutes.js      ← Test routes (for debugging)
    │
    ├── uploads/               ← Property images saved here after upload
    ├── .env                   ← Secret keys (NEVER push to GitHub)
    └── package.json           ← List of all npm packages used
```

---

## PART 2 — WHAT HAPPENS ON EACH PAGE

### Page 1 — index.html (Landing Page)
```
What user sees: Home page with featured properties, hero section
What JS does:   Fetches properties from API, displays cards
File:           frontend/js/index.js
API called:     GET /api/property/all
```

---

### Page 2 — login.html (Login Page)
```
What user sees: Email + Password form, Google login button, Remember Me checkbox
What happens:
  1. User types email + password → clicks Login
  2. login.js sends POST /api/auth/login to backend
  3. Backend checks: user exists? → password correct? → create JWT token
  4. Frontend receives token → saves in localStorage or sessionStorage
  5. Role is owner? → redirect to add-property.html
     Role is buyer? → redirect to browse-properties.html

Key code:
  storage.setItem('smartnest_token', data.token)
  storage.setItem('smartnest_user', JSON.stringify(data.user))

Remember Me checked   → localStorage  (stays even after closing browser)
Remember Me unchecked → sessionStorage (deleted when tab closes)

File: frontend/js/login.js
API: POST /api/auth/login
```

---

### Page 3 — register.html (Register Page)
```
What user sees: Name, Email, Password fields + role picker (Owner/Buyer)
What happens:
  1. User fills form → clicks Register
  2. register.js sends POST /api/auth/register
  3. Backend checks: email already exists? → hash password → save to DB
  4. Success → redirect to login.html

File: frontend/js/register.js
API: POST /api/auth/register
```

---

### Page 4 — browse-properties.html (Buyer Dashboard)
```
What user sees: All property cards, search bar, filters (location, price, bedrooms)
What happens:
  1. Page loads → fetch GET /api/property/all → display all properties
  2. User types in search → filter cards in real time (JavaScript)
  3. User clicks heart icon → property saved to localStorage (favourites)
  4. User clicks a card → go to property-detail.html?id=xxxxx

File: frontend/js/browse-properties.js
API: GET /api/property/all
```

---

### Page 5 — add-property.html (Owner Dashboard)
```
What user sees: Form to add property, list of own properties, edit/delete buttons
What happens:
  ADD:
    1. Owner fills title, price, location, bedrooms, images → submit
    2. Sends POST /api/property/add with JWT token in header
    3. Middleware checks token → allowed → saves property + images to DB

  EDIT:
    1. Owner clicks Edit → form fills with existing data
    2. Owner changes fields → submit → PUT /api/property/:id

  DELETE:
    1. Owner clicks Delete → confirm dialog
    2. Sends DELETE /api/property/:id → removed from DB

File: frontend/js/add-property.js
APIs: POST /api/property/add
      PUT  /api/property/:id
      DELETE /api/property/:id
Protected: YES (needs JWT token)
```

---

### Page 6 — property-detail.html (Property Detail)
```
What user sees: Full property info, image gallery with thumbnails, contact owner button
What happens:
  1. URL has ?id=xxxxx
  2. property-detail.js reads id from URL
  3. Fetches GET /api/property/:id
  4. Displays all images in gallery with thumbnail navigation

File: frontend/js/property-detail.js
API: GET /api/property/:id
```

---

### Page 7 — profile.html (User Profile)
```
What user sees: Name, email, role displayed. Change password form.
What happens:
  1. Page loads → reads smartnest_user from localStorage → displays info
  2. User fills old password + new password → submit
  3. Calls POST /api/auth/reset-password

File: frontend/js/profile.js
API: POST /api/auth/reset-password
```

---

### Page 8 — forgot-password.html (OTP Reset — 3 Steps)
```
STEP 1 — Enter Email:
  → POST /api/auth/send-otp
  → Backend generates 6-digit OTP, saves to DB with 10min expiry
  → Resend API sends OTP to email

STEP 2 — Enter OTP:
  → POST /api/auth/verify-otp
  → Backend checks: OTP match? + not expired?
  → Success → clear OTP from DB → go to step 3
  → 10 minute countdown timer shown, Resend button appears on expire

STEP 3 — Set New Password:
  → POST /api/auth/reset-password
  → Backend bcrypt.hash(newPassword) → save to DB

File: frontend/js/forgot-password.js
```

---

### Page 9 — auth-callback.html (Google OAuth Landing)
```
What user sees: Spinner (loading screen) for 1-2 seconds
What happens:
  1. After Google login, backend redirects here with token in URL
  2. auth-callback.js reads token from URL
  3. Saves token + user to localStorage
  4. Reads user role → redirects to correct dashboard

File: frontend/js/auth-callback.js
```

---

## PART 3 — BACKEND FILES EXPLAINED

### server.js — Starting Point
```
1. dotenv.config()         → loads .env file (reads secret keys)
2. connectDB()             → connects to MongoDB Atlas
3. app.use(cors())         → allows frontend to call backend
4. app.use(express.json()) → reads JSON from request body
5. app.use(session())      → needed for Google OAuth
6. app.use(passport)       → starts Google OAuth
7. app.use('/uploads')     → serves uploaded images as static files
8. app.use("/api/auth")    → connects auth routes
9. app.use("/api/property")→ connects property routes
10. app.listen(4000)       → starts server on port 4000
```

---

### models/user.js — User Schema
```
Fields saved for every user:
  name      → String, required
  email     → String, required, unique (no two same emails)
  password  → String (stored as bcrypt hash, NEVER plain text)
  role      → "buyer" or "owner" (default: buyer)
  otp       → 6-digit string (null when not resetting password)
  otpExpiry → Date when OTP expires (null when not resetting)
  createdAt → auto added by timestamps: true
  updatedAt → auto added by timestamps: true
```

---

### models/property.js — Property Schema
```
Fields saved for every property:
  title       → property name
  description → about the property
  price       → number (in rupees)
  location    → city/area string
  bedrooms    → number
  bathrooms   → number
  area        → square feet
  image       → first image path (/uploads/abc.jpg)
  images      → array of all image paths
  owner       → links to User who created it (ObjectId)
  createdAt   → auto timestamp
```

---

### routes/authRoutes.js — Auth URLs
```
POST /api/auth/register       → registerUser
POST /api/auth/login          → loginUser
POST /api/auth/send-otp       → sendOtp
POST /api/auth/verify-otp     → verifyOtp
POST /api/auth/reset-password → resetPassword
```

---

### routes/propertyRoutes.js — Property URLs
```
GET    /api/property/all  → getAllProperties  (no auth needed)
GET    /api/property/:id  → getPropertyById   (no auth needed)
POST   /api/property/add  → addProperty       (needs JWT token)
PUT    /api/property/:id  → updateProperty    (needs JWT token)
DELETE /api/property/:id  → deleteProperty    (needs JWT token)
```

---

## PART 4 — HOW A REQUEST FLOWS

### Login Flow
```
Browser → POST /api/auth/login { email, password }
  → authRoutes.js → loginUser()
  → User.findOne({ email })     check DB
  → bcrypt.compare(pw, hash)    check password
  → jwt.sign({ id, role })      create token
  → res.json({ token, user })
Browser → localStorage.setItem("smartnest_token", token)
        → redirect to dashboard
```

### Protected Route Flow (Add Property)
```
Browser → POST /api/property/add
          Header: Authorization: Bearer eyJ...
  → propertyRoutes.js → protect middleware runs FIRST
  → jwt.verify(token, SECRET) → decoded = { id, role }
  → req.user = decoded → next()
  → addProperty() runs
  → Property.create({ ...data, owner: req.user.id })
  → res.json({ success: true })
```

---

## PART 5 — CONCEPTS LEARNED IN DETAIL

---

### 1. JWT — JSON Web Token

**Simple idea — Hotel key card:**
```
Check in at hotel  → hotel gives KEY CARD
Go to your room    → swipe card → door opens
Check out          → card stops working

User logs in       → server gives TOKEN
User opens page    → send token → server allows
Token expires      → user must login again
```

**What JWT looks like:**
```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMyIsInJvbGUiOiJvd25lciJ9.xK9sd2PlmN
   HEADER                    PAYLOAD                           SIGNATURE
```

**Your code — Creating token (login):**
```js
const token = jwt.sign(
  { id: user._id, role: user.role },  // data you store inside token
  process.env.JWT_SECRET,              // secret key only your server knows
  { expiresIn: "7d" }                  // token dies after 7 days
);
```

**Your code — Verifying token (middleware):**
```js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;  // { id: "123", role: "owner" }
next();              // go to controller
```

**Two ways token stops working:**
- Logout → frontend deletes token from localStorage
- Expiry → after 7 days server rejects it automatically

---

### 2. bcrypt — Password Hashing

**Simple idea — Meat grinder:**
```
Password → put in grinder → hash comes out
Hash → cannot put back → get password   (ONE WAY)
```

**Without bcrypt (DANGEROUS):**
```
User sets password:  mypassword123
Stored in DB:        mypassword123   ← anyone can read it
```

**With bcrypt (SAFE):**
```
User sets password:  mypassword123
Stored in DB:        $2a$10$xK9sd2PlmNwbzHt...   ← unreadable
```

**What is Salt:**
```
Salt = random string added before hashing
mypassword123 + $2a$10$N9qo8... → completely different hash every time
Two users with same password → get DIFFERENT hashes
```

**Salt rounds = 10 → hashes 1024 times**

**Your code:**
```js
// Register — hash the password
const hashedPassword = await bcrypt.hash(password, 10);

// Login — compare what user typed with hash in DB
const isMatch = await bcrypt.compare(password, user.password);
// isMatch = true → login allowed
// isMatch = false → wrong password
```

**How compare works inside:**
```
Takes plain password  → mypassword123
Takes hash from DB    → $2a$10$xK9sd2...
Extracts salt from hash automatically
Re-hashes with same salt → compares result
Match? → true ✅    No match? → false ❌
```

---

### 3. Middleware — protect

**Simple idea:**
```
Request → protect() → check token → valid? → next() → controller
                                  → invalid? → 401 stop here
```

**Your code:**
```js
const protect = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;   // controller now knows who is logged in
  next();               // go to controller
};
```

**Used on:**
```
POST /api/property/add    → protect → addProperty
PUT  /api/property/:id    → protect → updateProperty
DELETE /api/property/:id  → protect → deleteProperty
```

---

### 4. Async / Await

**Why we need it:**
```
DB calls take time (100-500ms)
API calls take time
Without async/await → code does not wait → gets undefined
With async/await    → code waits → gets correct data
```

**Your code:**
```js
const registerUser = async (req, res) => {   // async = has await inside
  try {
    const user = await User.findOne({ email }); // await = wait for DB
    // runs only after DB responds
  } catch (error) {
    res.status(500).json({ message: "Server Error" }); // if anything fails
  }
};
```

---

### 5. REST API + HTTP Methods

| Method | Used for | Your project |
|---|---|---|
| GET | Read data | Get all properties, get one property |
| POST | Create data | Register, Login, Add property, Send OTP |
| PUT | Update data | Edit property |
| DELETE | Delete data | Delete property |

**Status codes:**
```
200 → OK (success)
201 → Created (register, add property)
400 → Bad request (wrong password, user exists)
401 → Unauthorized (no token or wrong token)
404 → Not found (user not found, property not found)
500 → Server error (unexpected crash)
```

---

### 6. MongoDB / Mongoose Operations

```js
User.findOne({ email })              // find one user by email
User.create({ name, email, role })   // create new user in DB
user.save()                          // save changes to existing user
Property.find()                      // get ALL properties
Property.findById(id)                // get ONE property by ID
Property.findByIdAndUpdate(id, data) // find and update
Property.findByIdAndDelete(id)       // find and delete
.populate('owner', 'name email')     // also get owner name+email from User collection
```

---

### 7. OTP Flow (Forgot Password)

```
Step 1 → User enters email
Step 2 → Server: Math.floor(100000 + Math.random() * 900000) → 6-digit OTP
Step 3 → Server: otpExpiry = Date.now() + 10 minutes
Step 4 → Save OTP + expiry to user in MongoDB
Step 5 → Resend API sends OTP to email
Step 6 → User enters OTP
Step 7 → Server: OTP match? + not expired? → both pass → clear OTP from DB
Step 8 → User sets new password → bcrypt.hash → save to DB
```

---

### 8. Environment Variables (.env)

```
MONGO_URI          → link to MongoDB Atlas database
JWT_SECRET         → secret key to sign/verify tokens
RESEND_API_KEY     → key to send emails
GOOGLE_CLIENT_ID   → Google OAuth app ID
GOOGLE_CLIENT_SECRET → Google OAuth secret
SESSION_SECRET     → secret for Express session
```

```js
// Used in code as:
process.env.JWT_SECRET
process.env.MONGO_URI
```

**NEVER push .env to GitHub → already in .gitignore**

---

### 9. Packages Used

| Package | Why |
|---|---|
| express | Create server and routes |
| mongoose | Connect to MongoDB, query DB |
| bcryptjs | Hash passwords |
| jsonwebtoken | JWT token system |
| dotenv | Load .env file |
| cors | Allow frontend to call backend |
| multer | Handle image file uploads |
| passport | Google OAuth |
| passport-google-oauth20 | Google strategy for passport |
| express-session | Session for Google OAuth |
| resend | Send emails via HTTP API |
| nodemon | Auto restart server while coding |

---

### 10. Nodemailer vs Resend

```
Nodemailer → sends email via SMTP (port 465/587)
           → Render free plan BLOCKS these ports ❌
           → OTP emails stopped working on Render

Resend     → sends email via HTTP (port 443)
           → Render allows port 443 ✅
           → Switched to Resend → emails work again
```

---

### 11. require() and module.exports

```js
// module.exports → share this file with others
module.exports = { registerUser, loginUser };

// require() → import another file or package
const { registerUser } = require("../controllers/authController");
const bcrypt = require("bcryptjs");  // from npm
```

**Path meaning:**
```
"../models/user"   → go one folder back, then into models folder, open user.js
"./config/db"      → stay in same folder, go into config, open db.js
"bcryptjs"         → from node_modules (installed package)
```

---

## PART 6 — ALL TERMINAL COMMANDS USED

| Command | Why |
|---|---|
| `npm init -y` | Create package.json — start project |
| `npm install` | Install all packages from package.json |
| `npm install express` | Install one package |
| `npm start` | Start the server |
| `node server.js` | Run server manually |
| `git init` | Start git in project |
| `git status` | See changed files |
| `git add filename` | Stage specific file |
| `git commit -m "msg"` | Save changes with message |
| `git push` | Push code to GitHub |

---

"SmartNest is a full-stack real estate platform I built using Node.js, Express.js, and MongoDB. It has two roles — owners can list properties and buyers can browse them. I implemented JWT authentication, bcrypt password hashing, Google OAuth login, and a 3-step OTP-based password reset. For image uploads I used Multer. During deployment on Render, I faced an issue where Nodemailer stopped working because Render blocks SMTP ports. I debugged it and switched to Resend API which uses HTTP — this fixed the issue completely."
