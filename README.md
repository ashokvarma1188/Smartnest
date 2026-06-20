# 🏠 SmartNest — Direct Property, No Broker

> A full-stack real estate platform where owners list directly and buyers connect — no broker, no commission, no middleman.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

---

## 💡 The Problem SmartNest Solves

In India, buying or renting a property usually means dealing with a broker who stands between owner and buyer — and charges commission from both sides.

| Without SmartNest | With SmartNest |
|---|---|
| Owner → Broker → Buyer | Owner → Buyer (Direct) |
| Owner pays commission | Zero commission |
| Buyer pays extra money | Buyer pays only property price |
| Broker controls information | Full transparency |

**SmartNest removes the broker completely.**

---

## ✨ Features

### For Property Owners
- 🔐 Secure Register and Login with JWT Authentication
- 🏡 Add Properties with title, price, location, bedrooms, area, description, and photo
- ✏️ Edit Property details anytime
- 🗑️ Delete Property listings
- 📊 Owner Dashboard showing all listings at a glance

### For Buyers
- 🔍 Browse All Properties in one clean page
- 🔎 Live Search by title or location
- 📞 Contact Owner Directly — see real owner name and email, no broker involved

### Security
- 🔑 JWT-based authentication
- 🛡️ Protected routes — only logged-in owners can add, edit, delete
- 🔒 Forgot Password — reset password with email
- 🧂 Passwords hashed with bcrypt

### Extra
- 📸 Photo Upload for each property
- 👤 Role-based access — Owner dashboard vs Buyer browse page

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcryptjs |
| File Upload | Multer |

---

## 📁 Project Structure

    SmartNest/
    ├── frontend/
    │   ├── index.html
    │   ├── login.html
    │   ├── register.html
    │   ├── forgot-password.html
    │   ├── add-property.html
    │   └── browse-properties.html
    │
    └── server/
        ├── server.js
        ├── config/db.js
        ├── models/
        │   ├── user.js
        │   └── property.js
        ├── controllers/
        │   ├── authController.js
        │   └── propertyController.js
        ├── middleware/
        │   └── authMiddleware.js
        ├── routes/
        │   ├── authRoutes.js
        │   └── propertyRoutes.js
        └── uploads/

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/reset-password` | Reset user password |

### Properties
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/property/all` | No | Get all properties |
| POST | `/api/property/add` | Owner | Add new property |
| PUT | `/api/property/:id` | Owner | Update property |
| DELETE | `/api/property/:id` | Owner | Delete property |

---

## ⚙️ Setup and Installation

**1. Clone the repository**

    git clone https://github.com/ashokvarma1188/SmartNest.git
    cd SmartNest/server
    npm install

**2. Create `.env` inside `server/` folder**

    PORT=4000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key

**3. Start the server**

    node server.js

**4. Open the frontend**

Open `frontend/login.html` with Live Server in VS Code.

---

## 🎯 Why I Built This

Broker commission is a real problem in India's real estate market. Both owners and buyers end up paying extra money to a middleman who simply connects two parties.

SmartNest solves this by building a platform where:
- **Owners list properties themselves** — full control, no commission
- **Buyers browse and contact directly** — pay only the actual property price
- **No broker. No commission. No middleman.**

---

## 🔮 Future Features

- [ ] AI-based price prediction for buyers
- [ ] Neighborhood score — safety, schools, transport
- [ ] Multiple property images per listing
- [ ] Filter search by price range and bedrooms
- [ ] Deploy to cloud — Render + Vercel

---

## 👨‍💻 Author

**Ashok Varma**

GitHub: [@ashokvarma1188](https://github.com/ashokvarma1188)

---

> *SmartNest — Because the deed should change hands directly.*
