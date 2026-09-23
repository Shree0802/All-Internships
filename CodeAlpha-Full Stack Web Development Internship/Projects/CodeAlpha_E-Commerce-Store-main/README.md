# 🛍️ ShopSphere – Modern Full Stack E-Commerce Store
# Website Link: https://modern-full-stack-e-commerce-store.vercel.app/

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express-v4.19-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-v8.4-brightgreen.svg)](https://www.mongodb.com/)

**ShopSphere** is a complete, production-ready, full-stack E-Commerce platform built for the **CodeAlpha Full Stack Development Internship**. It combines a clean Model-View-Controller (MVC) Node.js & Express API with a responsive, glassmorphic, micro-animated Vanilla HTML5/CSS3/JS ES6+ frontend.

---

## 🌟 Key Features

### 🔐 Authentication & Authorization
- **JWT Authentication**: Encrypted JSON Web Tokens stored in HttpOnly cookies and Bearer headers.
- **Bcrypt Hashing**: Passwords salt-hashed with `bcryptjs`.
- **Protected Routes**: Middleware enforcement for protected user endpoints and admin privileges.
- **User Profiles**: View and update contact info, shipping address, and password.

### 📦 Product Catalog & Search
- **25+ Realistic Products**: Pre-seeded database across 7 categories (*Electronics, Fashion, Shoes, Books, Accessories, Home Appliances, Sports*).
- **Advanced Filtering**: Filter by category, price range, and rating.
- **Live Search & Autocomplete**: Real-time header search with instant product suggestions.
- **Sorting**: Sort by price (Low to High / High to Low), newest arrivals, or highest rated.
- **Pagination**: Server-side and client-side pagination.

### 🛒 Shopping Cart & Orders
- **Cart Management**: Add items, update quantities, delete items, and calculate subtotal/tax/shipping dynamically.
- **Guest & Auth Cart Sync**: Guest carts stored in local storage seamlessly sync upon sign-in.
- **Checkout Flow**: Complete multi-step address collection, payment method selection (*Credit Card, PayPal, COD*), and order placement.
- **Order Tracking & History**: User dashboard tracking order status (*Processing, Shipped, Delivered*).

### 🎨 Design & UI/UX Excellence
- **Theme Support**: Seamless Light & Dark mode toggle with local storage persistence.
- **Modern Styling**: CSS custom properties, glassmorphism, responsive grid layouts, and micro-animations.
- **Notification System**: Built-in non-intrusive Toast notifications for immediate feedback.
- **Responsive Layout**: Designed for mobile, tablet, and widescreen desktop displays.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla CSS variables), JavaScript ES6+ Modules
- **Backend**: Node.js, Express.js (MVC Pattern)
- **Database**: MongoDB, Mongoose ODM (with automatic fallback to `mongodb-memory-server` for out-of-the-box demo execution)
- **Security & Utilities**: `jsonwebtoken`, `bcryptjs`, `express-validator`, `multer`, `cors`, `cookie-parser`, `dotenv`

---

## 📁 Project Folder Structure

```
shopsphere/
├── client/
│   ├── css/
│   │   ├── main.css           # Global design system & tokens
│   │   ├── components.css     # Navbar, product cards, toast, modals
│   │   ├── dark-mode.css      # Dark theme overrides
│   │   └── responsive.css     # Mobile & tablet breakpoints
│   ├── js/
│   │   ├── api.js             # Centralized fetch wrapper with JWT interceptor
│   │   ├── auth.js            # User session & registration manager
│   │   ├── cart.js            # Shopping cart state manager
│   │   ├── wishlist.js        # User wishlist manager
│   │   ├── products.js        # Product card renderer & catalog filters
│   │   ├── product-details.js # Single product details manager
│   │   ├── checkout.js        # Checkout & order submission handler
│   │   ├── profile.js         # Dashboard & order history viewer
│   │   ├── toast.js           # Toast notification system
│   │   └── main.js            # Theme toggle, search autocomplete, mobile menu
│   ├── pages/
│   │   ├── products.html
│   │   ├── product-details.html
│   │   ├── cart.html
│   │   ├── checkout.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── profile.html
│   │   ├── order-success.html
│   │   ├── order-history.html
│   │   ├── about.html
│   │   ├── contact.html
│   │   └── 404.html
│   └── index.html             # Landing page
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB connection & memory-server fallback
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── validateMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   └── orderRoutes.js
│   ├── seeders/
│   │   └── seedData.js        # 25+ realistic products across 7 categories
│   ├── utils/
│   │   ├── apiFeatures.js
│   │   └── generateToken.js
│   ├── .env.example
│   └── server.js              # Server entry point
├── package.json
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- Optional: Local [MongoDB](https://www.mongodb.com/try/download/community) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (if omitted, the server will automatically launch an in-memory database for testing).

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/shopsphere
JWT_SECRET=shopsphere_super_secret_jwt_key_2026_codealpha
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
```

### Step 3: Seed Database (25+ Products & Admin/User Accounts)
```bash
npm run seed
```
*Seeded Credentials:*
- **Admin**: `admin@shopsphere.com` / `adminpassword123`
- **User**: `user@shopsphere.com` / `userpassword123`

### Step 4: Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5000`.

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | Public |
| `POST` | `/api/auth/logout` | Clear auth cookie | Public |
| `GET` | `/api/auth/profile` | Get current user profile | Private |
| `PUT` | `/api/auth/profile` | Update profile & address | Private |
| `POST` | `/api/auth/wishlist/:productId` | Toggle product in wishlist | Private |

### Products (`/api/products`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/products` | Get products (search, filter, sort, paginate) | Public |
| `GET` | `/api/products/featured` | Get top featured products | Public |
| `GET` | `/api/products/categories` | Get category breakdown | Public |
| `GET` | `/api/products/:id` | Get single product details | Public |
| `POST` | `/api/products` | Create product | Admin |
| `PUT` | `/api/products/:id` | Update product | Admin |
| `DELETE` | `/api/products/:id` | Delete product | Admin |

### Cart (`/api/cart`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/cart` | Get user shopping cart | Private |
| `POST` | `/api/cart` | Add item / update quantity | Private |
| `PUT` | `/api/cart/item` | Change quantity of item | Private |
| `DELETE` | `/api/cart/item/:productId` | Remove item from cart | Private |
| `DELETE` | `/api/cart` | Empty entire cart | Private |

### Orders (`/api/orders`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/orders` | Place new order | Private |
| `GET` | `/api/orders` | Get logged-in user orders | Private |
| `GET` | `/api/orders/:id` | Get specific order by ID | Private |


## 📋 Evaluation & Testing Checklist

- [x] All 25+ items seeded across 7 distinct categories.
- [x] JWT Registration, Login, Logout, and Protected Route Enforcement.
- [x] Live search suggestions and category/price filtering.
- [x] Add to Cart, Update Quantity, Remove Item, and Subtotal calculations.
- [x] Multi-step Checkout flow, Order placement, and Stock decrementing.
- [x] User Profile dashboard and Order History tracking.
- [x] Dark/Light Theme toggle with persistence.
- [x] Toast notification feedback for all actions.
- [x] Fully responsive layout on mobile, tablet, and desktop views.

---

## 📄 License
Distributed under the **MIT License**. Created for **CodeAlpha Internship Evaluation**.
