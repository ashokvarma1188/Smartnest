# SmartNest — Learning Notes

Everything I learned while building this project.

---

## 1. JWT — JSON Web Token

**What it is:** After login, server creates a signed token with user data. Frontend stores it and sends it in every request.

**Flow:**
```
User logs in → server creates token → frontend stores in localStorage
Every request → send token in header → middleware verifies → allow/reject
Logout → delete token from localStorage
```

**Key functions:**
```js
jwt.sign({ id, role }, SECRET, { expiresIn: "7d" })  // create token
jwt.verify(token, SECRET)                              // verify token
```

**Where in project:**
- Created: `server/controllers/authController.js` → `loginUser`
- Verified: `server/middleware/authMiddleware.js` → `protect`
- Stored: `frontend/js/login.js` → `localStorage.setItem("smartnest_token", token)`

---

## 2. bcrypt — Password Hashing

**What it is:** Converts plain password into unreadable hash. One-way — cannot be reversed.

**Why:** Even if database is hacked, attacker cannot read passwords.

**Key functions:**
```js
bcrypt.hash(password, 10)           // hash password (10 = salt rounds)
bcrypt.compare(password, hash)      // compare on login → true/false
```

**Salt:** Random string added to password before hashing so same password gives different hash every time.

**Salt rounds = 10** → hashes 1024 times → more secure, slightly slower.

**Where in project:**
- Hashing: `server/controllers/authController.js` → `registerUser`
- Comparing: `server/controllers/authController.js` → `loginUser`

---

## 3. Middleware — protect

**What it is:** A function that runs BEFORE the main controller. Checks if user is logged in.

**Flow:**
```
Request → protect middleware → check token → valid? → next() → controller
                                           → invalid? → 401 Unauthorized
```

**Code:**
```js
const protect = async (req, res, next) => {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;  // now controller knows who is logged in
  next();              // go to controller
};
```

**Where in project:** `server/middleware/authMiddleware.js`

---

## 4. Async / Await

**What it is:** Way to handle operations that take time (DB calls, API calls).

```js
// Without async/await (old way - callbacks)
User.findOne({ email }, function(err, user) { ... })

// With async/await (modern way)
const user = await User.findOne({ email });
```

**Rule:** Always use `try/catch` with async/await to handle errors.

---

## 5. REST API + HTTP Methods

| Method | Used for | Example |
|---|---|---|
| GET | Read data | Get all properties |
| POST | Create data | Register, Login, Add property |
| PUT | Update data | Edit property |
| DELETE | Delete data | Delete property |

**Status codes:**
- 200 → OK
- 201 → Created
- 400 → Bad request (wrong password, user exists)
- 401 → Unauthorized (no token)
- 404 → Not found
- 500 → Server error

---

## 6. MongoDB / Mongoose

**Key operations:**
```js
User.findOne({ email })          // find one user by email
User.create({ name, email })     // create new user
user.save()                      // save changes to existing user
User.findByIdAndUpdate(id, data) // find and update
User.findByIdAndDelete(id)       // find and delete
```

---

## 7. OTP Flow (Forgot Password)

```
Step 1 → User enters email
Step 2 → Server generates 6-digit OTP → saves to DB with 10min expiry
Step 3 → Server sends OTP to email via Resend API
Step 4 → User enters OTP
Step 5 → Server checks: OTP match? + not expired?
Step 6 → User sets new password → bcrypt.hash → save to DB
```

**Where in project:** `server/controllers/authController.js` → `sendOtp`, `verifyOtp`, `resetPassword`

---

## 8. Environment Variables (.env)

**What it is:** File that stores secret keys. Never pushed to GitHub.

```
MONGO_URI=mongodb+srv://...
JWT_SECRET=myrandomsecretkey
RESEND_API_KEY=re_xxxx
GOOGLE_CLIENT_ID=xxxx
GOOGLE_CLIENT_SECRET=xxxx
```

**How to use in code:**
```js
process.env.JWT_SECRET
process.env.MONGO_URI
```

**Important:** Always add `.env` to `.gitignore`

---

## 9. Packages Used

| Package | Why |
|---|---|
| express | Create server and routes |
| mongoose | Connect to MongoDB |
| bcryptjs | Hash passwords |
| jsonwebtoken | JWT token system |
| dotenv | Load .env file |
| cors | Allow frontend to call backend |
| multer | Image file uploads |
| passport | Google OAuth |
| resend | Send emails via HTTP |
| nodemon | Auto restart server while coding |

---

## 10. Nodemailer vs Resend

**Nodemailer** — sends email via SMTP (port 465/587)
- Render free plan BLOCKS these ports ❌

**Resend** — sends email via HTTP (port 443)
- Render allows this ✅
- That is why we switched from Nodemailer to Resend

---

## Interview Questions to Practice

1. What is JWT? How does authentication work?
2. Why do we hash passwords? What is salt?
3. What is middleware? How does protect middleware work?
4. What is the difference between SQL and NoSQL?
5. What are HTTP methods? What status codes did you use?
6. Explain your forgot password flow
7. What is async/await? What is the difference from callbacks?
8. What is MVC pattern? How is your project structured?
9. Why did you switch from Nodemailer to Resend?
10. How does Google OAuth work in your project?
