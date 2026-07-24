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
  storage.setItem('smartnest_token', data.token)   ← save token
  storage.setItem('smartnest_user', JSON.stringify(data.user)) ← save user

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
    2. add-property.js sends POST /api/property/add with token in header
    3. Middleware checks token → allowed → saves property to DB
    4. Images saved in server/uploads/ folder

  EDIT:
    1. Owner clicks Edit → form fills with existing data
    2. Owner changes fields → submit
    3. Sends PUT /api/property/:id

  DELETE:
    1. Owner clicks Delete → confirm dialog
    2. Sends DELETE /api/property/:id → removed from DB

File: frontend/js/add-property.js
APIs: POST /api/property/add
      PUT  /api/property/:id
      DELETE /api/property/:id
      GET  /api/property/all (to show owner's own listings)
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
  4. Displays all images in gallery
  5. User clicks thumbnails → main image changes

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
  3. Calls POST /api/auth/reset-password with email + new password
  4. Password updated in DB (bcrypt hash)

File: frontend/js/profile.js
API: POST /api/auth/reset-password
```

---

### Page 8 — forgot-password.html (OTP Reset)
```
What user sees: 3-step form → Email → OTP boxes → New Password
What happens:
  STEP 1 — Enter Email:
    → POST /api/auth/send-otp
    → Backend generates 6-digit OTP, saves to DB with 10min expiry
    → Resend API sends OTP to email

  STEP 2 — Enter OTP:
    → POST /api/auth/verify-otp
    → Backend checks: OTP match? + not expired?
    → Success → clear OTP from DB → go to step 3

  STEP 3 — Set New Password:
    → POST /api/auth/reset-password
    → Backend bcrypt.hash(newPassword) → save to DB

Timer: 10 minute countdown bar shown on step 2
Resend button: appears when timer expires

File: frontend/js/forgot-password.js
APIs: POST /api/auth/send-otp
      POST /api/auth/verify-otp
      POST /api/auth/reset-password
```

---

### Page 9 — auth-callback.html (Google OAuth Landing)
```
What user sees: Spinner (loading screen) for 1-2 seconds
What happens:
  1. After Google login, backend redirects here with token in URL
     Example: auth-callback.html?token=eyJ...&user={...}
  2. auth-callback.js reads token from URL
  3. Saves token to localStorage
  4. Reads user role → redirects to correct dashboard

File: frontend/js/auth-callback.js
```

---

## PART 3 — BACKEND FILES EXPLAINED

### server.js — Starting Point
```js
What it does: Creates the Express app and connects everything

Step by step:
1. dotenv.config()     → loads .env file (reads secret keys)
2. connectDB()         → connects to MongoDB Atlas
3. app.use(cors())     → allows frontend to call backend
4. app.use(express.json()) → reads JSON from request body
5. app.use(session())  → needed for Google OAuth
6. app.use(passport)   → starts Google OAuth
7. app.use('/uploads') → serves uploaded images as static files
8. app.use("/api/auth") → connects auth routes
9. app.use("/api/property") → connects property routes
10. app.listen(4000)   → starts server on port 4000
```

---

### config/db.js — MongoDB Connection
```js
What it does: Connects your server to MongoDB Atlas cloud database

mongoose.connect(process.env.MONGO_URI)
→ MONGO_URI is the secret link to your MongoDB database
→ Stored in .env file (never pushed to GitHub)
→ If connection fails → process.exit(1) → server stops
```

---

### models/user.js — User Schema
```js
What it does: Defines what a User document looks like in MongoDB

Fields saved for every user:
  name      → String, required
  email     → String, required, unique (no two same emails)
  password  → String, required (stored as bcrypt hash, never plain text)
  role      → "buyer" or "owner" (default: buyer)
  otp       → 6-digit OTP string (null when not resetting password)
  otpExpiry → Date when OTP expires (null when not resetting password)
  createdAt → auto added by timestamps: true
  updatedAt → auto added by timestamps: true
```

---

### models/property.js — Property Schema
```js
What it does: Defines what a Property document looks like in MongoDB

Fields saved for every property:
  title       → property name
  description → about the property
  price       → number (in rupees)
  location    → city/area string
  bedrooms    → number
  bathrooms   → number
  area        → square feet
  image       → first image path (e.g. /uploads/abc.jpg)
  images      → array of all image paths [ "/uploads/a.jpg", "/uploads/b.jpg" ]
  owner       → ObjectId linking to User who created it
  createdAt   → auto timestamp
```

---

### controllers/authController.js — Auth Logic
```js
What it does: All login/register/OTP functions

registerUser:
  → check if email exists → if yes, return error
  → bcrypt.hash(password, 10) → hash the password
  → User.create({ name, email, hashedPassword, role }) → save to DB
  → return success

loginUser:
  → User.findOne({ email }) → find user in DB
  → bcrypt.compare(password, user.password) → check password
  → jwt.sign({ id, role }, SECRET, { expiresIn: "7d" }) → create token
  → return token + user

sendOtp:
  → User.findOne({ email }) → user must exist
  → Math.floor(100000 + Math.random() * 900000) → generate 6-digit OTP
  → new Date(Date.now() + 10 * 60 * 1000) → expiry = now + 10 minutes
  → save OTP + expiry to user in DB
  → resend.emails.send() → send OTP to user email

verifyOtp:
  → User.findOne({ email })
  → user.otp !== otp → wrong OTP → error
  → new Date() > user.otpExpiry → expired → error
  → Both pass → clear OTP from DB → success

resetPassword:
  → User.findOne({ email })
  → bcrypt.hash(newPassword, 10)
  → user.password = hashedPassword → user.save()
```

---

### controllers/propertyController.js — Property Logic
```js
What it does: Add/Get/Edit/Delete property functions

addProperty:
  → req.files → get uploaded images from Multer
  → imagePaths = files.map(f => '/uploads/' + f.filename)
  → Property.create({ title, price, location, images, owner: req.user.id })

getAllProperties:
  → Property.find() → get all properties from DB
  → .populate('owner', 'name email') → also get owner's name + email

getPropertyById:
  → Property.findById(req.params.id) → find one property by ID in URL

updateProperty:
  → Property.findByIdAndUpdate(id, newData, { new: true })

deleteProperty:
  → Property.findByIdAndDelete(id)
```

---

### middleware/authMiddleware.js — JWT Check
```js
What it does: Runs BEFORE any protected route. Checks if user is logged in.

Step by step:
1. Read token from request header: req.headers.authorization
2. Token not found? → 401 Unauthorized → stop here
3. jwt.verify(token, SECRET) → check if valid
4. Decoded = { id, role } → set as req.user
5. next() → go to the actual controller

Where it is used:
  POST /api/property/add    → only logged in users can add
  PUT  /api/property/:id    → only logged in users can edit
  DELETE /api/property/:id  → only logged in users can delete
```

---

### routes/authRoutes.js — Auth URLs
```js
POST /api/auth/register      → registerUser
POST /api/auth/login         → loginUser
POST /api/auth/send-otp      → sendOtp
POST /api/auth/verify-otp    → verifyOtp
POST /api/auth/reset-password → resetPassword
```

---

### routes/propertyRoutes.js — Property URLs
```js
GET    /api/property/all   → getAllProperties  (no auth needed)
GET    /api/property/:id   → getPropertyById   (no auth needed)
POST   /api/property/add   → addProperty       (needs JWT token)
PUT    /api/property/:id   → updateProperty    (needs JWT token)
DELETE /api/property/:id   → deleteProperty    (needs JWT token)
```

---

## PART 4 — HOW REQUEST FLOWS (Full Picture)

### Normal Login Flow
```
Browser (login.html)
    ↓  POST /api/auth/login { email, password }
server.js receives request
    ↓  app.use("/api/auth", authRoutes)
authRoutes.js
    ↓  router.post("/login", loginUser)
authController.js → loginUser()
    ↓  User.findOne({ email })        → check MongoDB
    ↓  bcrypt.compare(pw, hash)       → check password
    ↓  jwt.sign({ id, role }, SECRET) → create token
    ↓  res.json({ token, user })
Browser receives token
    ↓  localStorage.setItem("smartnest_token", token)
    ↓  redirect to dashboard
```

---

### Protected Route Flow (Add Property)
```
Browser (add-property.html)
    ↓  POST /api/property/add
       Headers: { Authorization: "Bearer eyJ..." }
       Body: { title, price, location, images }
server.js
    ↓  app.use("/api/property", propertyRoutes)
propertyRoutes.js
    ↓  router.post("/add", protect, addProperty)
                           ↑
                    middleware runs FIRST
authMiddleware.js → protect()
    ↓  jwt.verify(token, SECRET) → decoded = { id, role }
    ↓  req.user = decoded
    ↓  next()  → go to addProperty
propertyController.js → addProperty()
    ↓  req.user.id → who is adding
    ↓  req.files   → images from Multer
    ↓  Property.create({ ...data, owner: req.user.id })
    ↓  res.json({ success: true, property })
Browser shows success message
```

---

## PART 5 — KEY CONCEPTS SUMMARY

### JWT
```
jwt.sign({ id, role }, SECRET, { expiresIn: "7d" })  → create token (login)
jwt.verify(token, SECRET)                              → verify token (every request)
Token stored in: localStorage ("smartnest_token")
Token sent in:   Authorization header of every API call
```

### bcrypt
```
bcrypt.hash(password, 10)           → convert password to hash (register)
bcrypt.compare(password, hash)      → check password on login
Salt rounds = 10 → hashes 1024 times → cannot be reversed
```

### Mongoose
```
User.findOne({ email })             → find one user
User.create({ name, email... })     → create new user
user.save()                         → save changes to existing user
Property.find()                     → get all properties
Property.findById(id)               → get one property
Property.findByIdAndUpdate(id, data)→ update property
Property.findByIdAndDelete(id)      → delete property
.populate('owner', 'name email')    → get owner's details from User collection
```

### async/await + try/catch
```js
const registerUser = async (req, res) => {  // async = this function has await inside
  try {
    const user = await User.findOne({ email }); // await = wait for DB to respond
    // ... rest of code
  } catch (error) {
    res.status(500).json({ message: "Server Error" }); // if anything breaks, catch it
  }
};
```

### Environment Variables (.env)
```
MONGO_URI        → link to MongoDB Atlas database
JWT_SECRET       → secret key to sign/verify tokens
RESEND_API_KEY   → key to send emails via Resend
GOOGLE_CLIENT_ID → Google OAuth app ID
GOOGLE_CLIENT_SECRET → Google OAuth secret
SESSION_SECRET   → secret for Express session

Used in code as: process.env.JWT_SECRET
NEVER push .env to GitHub → it is in .gitignore
```

---

## PART 6 — INTERVIEW QUESTIONS TO PRACTICE

1. Explain your project SmartNest in 2 minutes
2. What is JWT? How does authentication work in your project?
3. Why do we hash passwords? What is salt? What is bcrypt?
4. What is middleware? How does protect middleware work?
5. What is the difference between SQL and NoSQL?
6. What are HTTP methods? (GET POST PUT DELETE)
7. What are status codes? (200 201 400 401 404 500)
8. Explain your forgot password OTP flow step by step
9. What is async/await? Why do we use it?
10. What is MVC pattern? Explain with your project
11. What is CORS? Why did you use it?
12. Why did you switch from Nodemailer to Resend?
13. What is Multer? How did you use it for image uploads?
14. What is Passport.js? How does Google OAuth work?
15. What is populate() in Mongoose?
