# SwiftBite | Premium Food Delivery Web Application

🚀 **Live Web App:** [https://food-delivery-app-ecru-nine.vercel.app](https://food-delivery-app-ecru-nine.vercel.app)

SwiftBite is a state-of-the-art, high-end food delivery web application built with a React + Redux frontend and a Node.js + Express backend. 

It features dynamic dietary sorting (Veg/Non-Veg), full text search, item quantity adjustments, persistent cart states, a secure simulated checkout process, custom coupon codes, an active order status progress tracker with a built-in testing simulator, dark/light theme switching, and an administrative control panel.

---

## 📂 Project Structure

```text
food-delivery-app/
├── frontend/
│   ├── src/
│   │   ├── pages/         # Page views (Home, Cart, Checkout, Tracking, History, Auth, Admin)
│   │   ├── components/    # Reusable UI elements (Navbar, FoodCard, CartItem, OrderProgress, Footer)
│   │   ├── redux/         # Redux Toolkit store configurations & slices (auth, cart, foods, orders)
│   │   ├── services/      # Axios API service client settings with token interceptors
│   │   └── App.jsx        # Routing definitions and master page frame layout
│   ├── index.html         # HTML entry point (contains Google Fonts integrations)
│   └── vite.config.js     # Dev server settings & reverse proxy configurations
│
├── backend/
│   ├── controllers/       # Route request controller handlers (auth, foods, orders)
│   ├── models/            # Mongoose schema definitions (User, FoodItem, Order)
│   ├── routes/            # Express route endpoint mapping rules
│   ├── middleware/        # Authentication & error catching handlers
│   ├── utils/             # Database connection, JSON local fallback storage, JWT token signers
│   └── server.js          # Core Express server config, auto-seeder checks, and listener port
│
├── database/
│   └── README.md          # Details of local fallback JSON models & test credentials
│
└── README.md              # Project documentation and startup setup instructions
```

---

## ⚡ Quick Start Instructions

To run this project locally, execute the following commands in order.

### 1. Prerequisites
- **Node.js** (v16+) installed.
- **MongoDB** running locally (Optional - if missing, the backend automatically boots a **Local JSON File Database** fallback system, guaranteeing full operations immediately).

### 2. Configure Environment variables
Default environment configurations are already set up in `backend/.env`. If you want to customize them:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/swiftbite
JWT_SECRET=swiftbite_super_secret_jwt_key_987654321
```

### 3. Install Dependencies
Run npm installations in both the `frontend/` and `backend/` directories:

**For Backend:**
```bash
cd backend
npm install
```

**For Frontend:**
```bash
cd ../frontend
npm install
```

### 4. Start the Application
Open two terminal windows to run both servers concurrently.

**Terminal 1 (Start Backend API Server):**
```bash
cd backend
npm run dev
```
*The database automatically checks and auto-seeds the food menu and test credentials on first startup.*

**Terminal 2 (Start Vite React Client):**
```bash
cd frontend
npm run dev
```
*Vite will boot the client server on [http://localhost:3000](http://localhost:3000).*

---

## 🔐 Pre-seeded Test Accounts

To simplify testing, the app auto-registers two demo accounts:

### 1. Regular Customer Account
- **Email:** `user@example.com`
- **Password:** `password123`
- **Address:** `123 Main St, New York, NY`

### 2. Administrator Account
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Permissions:** Full access to edit/add food items and update order statuses in the **Admin Dashboard**.

---

## 💡 Key Design & Experience Features

1. **Light & Dark Theme support:** Controlled seamlessly via local storage sync.
2. **Interactive Cart Count adjustment:** Items can be incremented, decremented, or removed directly from the home menu cards or in the cart page.
3. **Cart subtotal rules:** Apply coupon code `SWIFT20` for 20% off food subtotal. Orders over $30 get FREE delivery.
4. **Order Status Simulator:** The order tracking screen contains a **Developer Testing Simulator** panel. Clicking "Advance Status" sends a request to the backend to cycles statuses (`Placed` -> `Preparing` -> `Out for Delivery` -> `Delivered`) to see the progress bar transition instantly.
5. **Admin panel controls:** Allows administrators to track active client orders and add new dishes to the catalog.
