# DYPULSE — College Lifestyle & Sports E-Commerce Platform

> **Tagline:** *"Feel the Campus. Live the Game."*

---

## 1. Project Title
**DYPULSE — Unified Collegiate Lifestyle, Sports Equipment & Custom Team Kit E-Commerce Platform**

---

## 2. DYPULSE Brand Introduction
**DYPULSE** is the premier collegiate athletic and lifestyle brand built exclusively for university athletes, intramural competitors, and campus culture trendsetters. Representing the dual pulse of university life, DYPULSE bridges rigorous varsity athletic performance with collegiate streetwear and creative identity under two distinct departments:
* **DYPULSE PLAY**: High-performance athletic equipment, tournament bats, footballs, racquets, training gear, gym accessories, and official athletic uniforms.
* **DYPULSE CAMPUS**: Collegiate lifestyle hoodies, oversized graphic tees, varsity bomber jackets, sneakers, campus backpacks, and everyday university accessories.

---

## 3. Tagline
> **"Feel the Campus. Live the Game."**

---

## 4. Project Overview
DYPULSE is a full-stack, production-grade e-commerce application designed to deliver an authentic collegiate shopping experience. Engineered with modern web standards, it integrates a unified catalog, server-authoritative integer paise currency calculations, persistent MongoDB carts and wishlists, atomic inventory management, promotional coupon validation, verified purchase reviews, a specialized custom **Team Kit Studio**, Razorpay test mode payments, multi-template transactional email notifications, and an administrative control portal.

---

## 5. Problem Statement
College campuses host thriving sports ecosystems and vibrant student communities, yet university students and sports captains face significant retail friction:
1. **Fragmented Retail Channels**: Students must purchase sports gear from traditional sporting goods stores while buying campus apparel from disparate fast-fashion outlets.
2. **Cumbersome Custom Jersey Orders**: Sports captains and club leaders traditionally order custom jerseys through informal WhatsApp channels or unverified local vendors, resulting in miscommunicated sizes, unstandardized pricing, and zero tracking.
3. **Student Budget Inflexibility**: Standard e-commerce platforms do not cater to student allowances or provide transparent budget-filtered collections.
4. **Unreliable Inventory & Payment Bugs**: Student shoppers frequently encounter checkout errors, race conditions during high-demand campus drops, and insecure payment workflows.

DYPULSE solves these challenges with a single, secure, transparent, and student-first e-commerce destination.

---

## 6. Target Users
* **Varsity Athletes & Sports Captains**: Ordering high-grade tournament equipment and coordinating custom jersey kits for inter-college tournaments.
* **College Students & Campus Trendsetters**: Seeking affordable, durable, and stylish collegiate streetwear, hoodies, and campus lifestyle gear.
* **Intramural Clubs & Collegiate Societies**: Sourcing branded merchandise, training bibs, and event wear.
* **Campus Store Administrators**: Managing products, monitoring variant inventory, fulfilling student orders, issuing custom kit quotes, and analyzing sales metrics.

---

## 7. Main Features

### 🛍️ Unified Product Catalog & Smart Navigation
* **Dual-Department System**: Instant toggling between **DYPULSE PLAY** and **DYPULSE CAMPUS** across all views.
* **Dynamic Variant Matrix**: Support for size and color variants, each with SKU tracking, variant-specific stock, and optional price overrides.
* **Advanced Multi-Criteria Search & Filters**: Full-text weighted search, category drilldowns, sport facets, price range bounding, and sort orders (`price-asc`, `price-desc`, `newest`, `featured`).
* **Explainable Product Recommendations**: Contextual recommendation engine suggesting complementary gear with visible pairing reasons (e.g., *"Frequently paired gear"*, *"Same Football collection"*).

### 🎯 Campus Budget Finder (`/budget-finder`)
* Dedicated budget navigation for student allowances with preset tiers: **Under ₹499**, **Under ₹999**, **Under ₹1,499**, and **Under ₹1,999**.
* Interactive slider control from ₹100 to ₹5,000 evaluating both base and variant prices in real time.

### 🎽 DYPULSE Team Kit Studio (`/team-kit-studio`)
* **Interactive Live SVG Jersey Mockup**: Real-time 3D athletic canvas preview rendering custom primary, secondary, and accent colors, collar styles (Round Neck, V-Neck, Polo Lapels, Sleeveless Mesh Tank, Quarter-Zip), team name, organization, uploaded crest, player name, and jersey number with instant Front/Back view rotation.
* **Dual-Track Ordering Experience**:
  * **Individual Custom Jersey**: Direct "Add Customized Kit to Bag" for single player orders with instant integer-paise cart synchronization and checkout.
  * **Varsity Squad RFQ (12+ Units)**: 7-step guided customization wizard for sports captains with subsidized bulk collegiate pricing, XS–XXL size breakdown, target tournament delivery date, and crest upload.
* **Customer Squad Dashboard**: Real-time status progression (`Submitted`, `Under Review`, `Quotation Prepared`, `Approved`, `In Production`, `Completed`) with direct RFQ cancellation and workshop notes inspection.
* **Administrative Quotation Issuer**: Line-item quotation builder with estimated unit prices, total cost calculations, and direct communication to student captains.

### 🛒 Persistent Cart, Wishlist & Authoritative Checkout
* **Persistent User Storage**: Authenticated shopping cart and wishlist saved in MongoDB; non-sensitive guest cart in `localStorage` seamlessly merges upon login.
* **Zero Client Price Trust**: All line items, shipping fees, discounts, and order totals are calculated strictly on the backend in integer paise.
* **Atomic Concurrency Protection**: Race-condition safe stock reservations using MongoDB atomic queries with automatic rollback on failed multi-item checkouts.
* **Idempotency Protection**: Optional idempotency keys prevent duplicate orders or double-charges during network retransmissions.

### 🎟️ Promotional Coupon Engine
* Flexible promotional rules supporting percentage discounts (with max caps) and flat deductions.
* Concurrency-safe usage tracking ensuring global usage limits (`usageLimit`) and per-customer limits (`perUserLimit`) cannot be breached by parallel requests.
* Automatic coupon rollback and replenishment on order cancellation or checkout failure.

### ⭐ Verified Student Reviews
* Enforces verified purchase eligibility: only customers with a delivered order containing the product can leave reviews (`403 REVIEW_ELIGIBILITY_REQUIRED`).
* Compound unique database indexing prevents duplicate reviews for the same order and product.
* Real-time automated calculation of product average rating and review counts.

### 💳 Razorpay Test Mode & Cash on Delivery (COD)
* Official Razorpay Node.js SDK integration with server-calculated order amounts.
* Cryptographic HMAC-SHA256 signature verification (`crypto.timingSafeEqual`) on backend.
* Webhook deduplication (`PaymentWebhookEvent`) and payment method switching (ONLINE ↔ COD).
* Full Cash on Delivery (COD) support for campus hostel deliveries.

### 📧 Multi-Template Transactional Notifications
* 7 responsive, branded HTML email templates: Account Verification, Password Reset, Order Confirmation, Order Status Progression, Order Cancellation, Team Kit Confirmation, and Team Kit Status Updates.
* Multi-provider engine supporting Mock test logger (development), Ethereal preview inboxes, and standard SMTP.

### 📊 Comprehensive Admin Control Portal (`/admin`)
* Database-derived analytics: Total Qualifying Sales Revenue (excluding cancelled orders), Realized Revenue, Average Order Value (AOV), and Low-Stock Variant Alerts.
* Complete CRUD management for Products, Variants, Categories, Orders, Team Kit Requests, Coupons, Reviews, and Inventory Adjustments.

---

## 8. Technology Stack

### Frontend
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 | Declarative user interface components |
| **Build Tool** | Vite 6 | Rapid Hot Module Replacement (HMR) and optimized Rollup chunking |
| **Styling** | Tailwind CSS v4 | Custom `@theme` tokens, athletic color gradients, and utility classes |
| **Routing** | React Router v6 | Client-side routing, protected auth routes, and admin guards |
| **Form Management** | React Hook Form + Zod | Schema validation and accessible form state handling |
| **State & HTTP** | React Context API + Axios | Global auth, cart, wishlist state, and interceptor-equipped HTTP client |
| **Icons & Alerts** | Lucide React + React Hot Toast | Lightweight iconography and accessible toast notifications |
| **Testing** | Vitest + React Testing Library | Component unit testing and user event verification |

### Backend
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js (ESM modules) | Event-driven JavaScript server environment |
| **Web Framework** | Express.js 4 | HTTP routing, RESTful API endpoints, and middleware pipeline |
| **Database** | MongoDB (Mongoose 8 ODM) | Document database with schema validation and indexing |
| **Session Storage** | `express-session` + `connect-mongo` | Server-side session persistence in MongoDB `sessions` collection |
| **Security** | Helmet, CORS, CSRF, Bcrypt (cost 12) | Defense against XSS, CORS misconfigurations, CSRF, and timing attacks |
| **Validation** | Zod middleware | Strict payload, parameter, and query string schema validation |
| **File Storage** | Multer + Cloudinary SDK | In-memory buffering with Cloudinary upload and local disk fallback |
| **Payments** | Razorpay Node.js SDK | Server payment order generation and cryptographic verification |
| **Email** | Nodemailer | Multi-provider transactional email delivery with exponential retries |
| **Testing** | Vitest + Supertest | Integration, concurrency, and API endpoint verification |

---

## 9. Architecture Overview

```
                                +-----------------------------------+
                                |      Student / Admin Client       |
                                |     (React 19 + Vite + Tailwind)  |
                                +-----------------+-----------------+
                                                  |
                                    HTTPS / WSS   | Session Cookie + CSRF
                                                  v
+---------------------------------------------------------------------------------------+
|                               Express.js Application Pipeline                         |
|                                                                                       |
|  [Security & Logging]       [Session & Auth]         [Routing & Validation]           |
|  - Helmet Security Headers  - MongoStore Sessions    - Versioned API: /api/v1/*       |
|  - Dynamic CORS Validation  - requireAuth Guard      - Zod Request Schema Validators  |
|  - Morgan Request Logger    - requireAdmin Guard     - CSRF Token Verification        |
|  - Centralized ErrorHandler - Bcrypt Hashing (Cost 12)                                |
+--------+----------------------------+-----------------------------+-------------------+
         |                            |                             |
         v                            v                             v
+------------------+         +------------------+          +------------------+
| MongoDB Database |         | Cloud Services   |          | Notification Svc |
| (Mongoose ODM)   |         | - Cloudinary CDN |          | - Nodemailer     |
| - Users & Orders |         | - Razorpay Test  |          | - SMTP / Mock    |
| - Products & SKU |         |                  |          |                  |
| - Sessions & Log |         |                  |          |                  |
+------------------+         +------------------+          +------------------+
```

---

## 10. Project Folder Structure

```
dypulse/
├── package.json               # Root scripts for multi-package orchestration
├── .gitignore                 # Root ignore rules (node_modules, .env, dist, uploads)
├── README.md                  # Comprehensive platform documentation
├── render.yaml                # Render Infrastructure-as-Code deployment blueprint
├── client/
│   ├── index.html             # Vite entry point with typography and meta tags
│   ├── vite.config.js         # Vite configuration with chunk splitting and path aliases
│   ├── vercel.json            # Vercel SPA routing rewrites and asset caching rules
│   ├── package.json           # Frontend dependencies and test scripts
│   ├── .env.example           # Client environment template
│   └── src/
│       ├── App.jsx            # Application route registry and route protection wrappers
│       ├── main.jsx           # React DOM root initialization
│       ├── components/
│       │   ├── layout/        # Header, Footer, MobileNav, Layout wrapper
│       │   ├── ui/            # Button, Badge, Input, Spinner, EmptyState, ProductCard
│       │   └── ProtectedRoute.jsx
│       ├── context/           # AuthContext, WishlistContext
│       ├── hooks/             # useCart, useProducts
│       ├── layouts/           # AdminLayout with responsive navigation drawer
│       ├── pages/             # Storefront, BudgetFinder, TeamKitStudio, Account, Orders
│       │   └── admin/         # Dashboard, Products, Orders, Inventory, TeamKits, Coupons
│       ├── services/          # Axios HTTP client with request/response interceptors
│       ├── styles/            # Tailwind theme tokens, brand variables, and animations
│       ├── test/              # Vitest + RTL frontend test suites
│       └── utils/             # formatters.js, constants.js
└── server/
    ├── package.json           # Backend dependencies and test runner configuration
    ├── .env.example           # Backend environment variable template
    ├── docs/
    │   └── openapi.yaml       # Complete OpenAPI 3.0 REST specification
    ├── public/
    │   └── uploads/           # Local disk image directory (development fallback)
    ├── src/
    │   ├── app.js             # Express app bootstrap, middleware stack, and routes
    │   ├── server.js          # HTTP server listener and graceful shutdown handlers
    │   ├── config/            # index.js (env validation), db.js (MongoDB Atlas setup)
    │   ├── controllers/       # Auth, Product, Cart, Order, TeamKit, Coupon, Review controllers
    │   ├── middleware/        # auth, csrf, errorHandler, upload, validate
    │   ├── models/            # User, Product, Category, Cart, Order, Coupon, Review, Log
    │   ├── routes/            # Versioned API routes (/api/v1/*)
    │   ├── scripts/           # createAdmin.js (secure administrator provisioning CLI)
    │   ├── seeds/             # Controlled demo seed scripts (categories, products, coupons)
    │   ├── services/          # inventory.service.js, payment.service.js, upload.service.js
    │   └── validators/        # Zod request validation schemas
    └── test/                  # Automated integration, security, and concurrency test suites
```

---

## 11. Screenshots Section

> *Below are visual UI representation blueprints demonstrating key views of the DYPULSE experience.*

```
+---------------------------------------------------------------------------------------+
|  DYPULSE VARSITY STOREFRONT                                                           |
|  [ PLAY ]  [ CAMPUS ]                 Search Gear...             [Wishlist] [Cart (2)]|
|                                                                                       |
|  [ HERO BANNER: FEEL THE CAMPUS. LIVE THE GAME. ]                                     |
|  Explore Tournament Bats, Performance Turf Shoes, and Collegiate Varsity Drops        |
|                                                                                       |
|  +--------------------+  +--------------------+  +--------------------+               |
|  | English Willow Bat |  | Varsity Bomber     |  | Pro Badminton Kit  |               |
|  | DYPULSE PLAY       |  | DYPULSE CAMPUS     |  | DYPULSE PLAY       |               |
|  | ₹2,999  [In Stock] |  | ₹1,899  [In Stock] |  | ₹1,299  [In Stock] |               |
|  +--------------------+  +--------------------+  +--------------------+               |
+---------------------------------------------------------------------------------------+
|  TEAM KIT STUDIO: 7-STEP CUSTOM JERSEY WIZARD                                         |
|  (1) Sport  ->  (2) Kit Type  ->  (3) Team Info  ->  (4) Colors  ->  (5) Sizes       |
|  [ Cricket ]    [ Full Kit ]      "DY Patil XI"      [Navy/Gold]     XS:2 S:5 M:5 L:3 |
|  Status: Reference TKS-948201-AX7B Generated -> Quotation Prepared                    |
+---------------------------------------------------------------------------------------+
|  ADMIN OPERATIONS PORTAL                                                              |
|  - Qualifying Revenue: ₹1,48,200 | Orders Placed: 42 | Low Stock Alerts: 3            |
|  - Recent Orders Ledger          | Team Kit Review   | Inventory Adjustment Log       |
+---------------------------------------------------------------------------------------+
```

---

## 12. Local Installation

### Prerequisites
* **Node.js**: v20 or higher (`v22`+ recommended)
* **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or free MongoDB Atlas cluster
* **npm**: v10 or higher

### Step 1: Clone Repository
```bash
git clone https://github.com/<your-username>/dypulse.git
cd dypulse
```

### Step 2: Install All Dependencies
Install dependencies for both `server` and `client` in one command:
```bash
npm run install:all
```
*(Or navigate into `server/` and `client/` separately and run `npm install`)*

---

## 13. Environment-Variable Setup

### Backend Configuration (`server/.env`)
Copy the server template:
```bash
cp server/.env.example server/.env
```
Populate values according to your local or staging environment:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dypulse
SESSION_SECRET=replace-with-a-random-64-character-string-for-session-encryption
CORS_ORIGIN=http://localhost:5173

# Optional: Cloudinary CDN (Leaves local disk fallback server/public/uploads if empty)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: Razorpay Test Mode (Defaults safely to Cash on Delivery if omitted)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Email Provider: 'mock' (logs to console), 'ethereal' (preview link), 'smtp' (live)
EMAIL_PROVIDER=mock
EMAIL_FROM="DYPULSE Campus Store <noreply@dypulse.edu>"
CLIENT_URL=http://localhost:5173

# Optional Admin Initial Seed
ADMIN_EMAIL=admin@dypulse.edu
ADMIN_PASSWORD=AdminSecure@DY2026
```

### Frontend Configuration (`client/.env`)
Copy the client template:
```bash
cp client/.env.example client/.env
```
Ensure the API endpoint points to your backend instance:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 14. Database Setup
1. Ensure your MongoDB daemon is running locally (`mongod` or Docker container) or have your MongoDB Atlas connection string ready.
2. The database schema, indexes, and collections are initialized automatically on application startup.
3. Database indexes are created automatically in development and managed via Mongoose models.

---

## 15. Seed-Data Instructions

To prevent accidental data loss in staging or production environments, **DYPULSE does NOT overwrite or seed the database on server startup**.

### Option A: Controlled Demo Seeding
Populates 15 categories, 46 athletic and collegiate products with realistic variant matrices, promotional coupons, and test accounts:
```bash
npm run seed
```
**Demo Accounts created:**
* **Administrator**: `admin@dypulse.com` / `DypulseAdmin@2024`
* **Student Customer**: `customer@dypulse.com` / `Customer@123`

### Option B: Secure Administrative Account Creation
To provision a clean administrator without loading demo catalog data:
```bash
# Using CLI parameters
npm run create-admin -- --email=varsity.admin@dypulse.edu --password="SecurePassword@2026" --firstName="Varsity" --lastName="Admin"

# Or using environment variables
ADMIN_EMAIL=varsity.admin@dypulse.edu ADMIN_PASSWORD="SecurePassword@2026" npm run create-admin
```

---

## 16. Development Commands

From the project root:

| Command | Action |
| :--- | :--- |
| `npm run dev:server` | Start backend with hot-reloading Nodemon on `http://localhost:5000` |
| `npm run dev:client` | Start frontend with Vite on `http://localhost:5173` |
| `npm run build:client` | Build optimized production bundle to `client/dist/` |
| `npm run seed` | Seed realistic demo catalog, categories, and test users |
| `npm run create-admin` | Provision or elevate an administrator account securely |
| `npm run test` | Run all automated tests across backend and frontend |
| `npm run test:server` | Run backend Vitest test suites |
| `npm run test:client` | Run frontend Vitest + Testing Library test suites |

---

## 17. API Documentation

DYPULSE provides full OpenAPI 3.0 specification files located in [`server/docs/openapi.yaml`](file:///c:/Users/Prathamesh/OneDrive/Desktop/My%20Projects/dypulse/server/docs/openapi.yaml) and served statically at `/docs/openapi.yaml`.

### Core API Endpoints

| Category | Method | Path | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/v1/health` | Public | Operational status, DB connection, uptime |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Register new customer account |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Authenticate session and set cookie |
| **Auth** | `POST` | `/api/v1/auth/logout` | Customer | Destroy session and clear cookie |
| **Auth** | `GET` | `/api/v1/auth/me` | Customer | Retrieve current user profile |
| **Catalog** | `GET` | `/api/v1/products` | Public | Search, filter, and paginate products |
| **Catalog** | `GET` | `/api/v1/products/:slug` | Public | Retrieve product details and variant matrix |
| **Cart** | `GET` | `/api/v1/cart` | Customer | Get cart with server-calculated totals in paise |
| **Cart** | `POST` | `/api/v1/cart/add` | Customer | Add item or variant to cart |
| **Cart** | `DELETE` | `/api/v1/cart/clear` | Customer | Clear all items from cart |
| **Orders** | `POST` | `/api/v1/orders` | Customer | Checkout and atomically reserve stock |
| **Orders** | `GET` | `/api/v1/orders/my-orders` | Customer | View customer order history |
| **Orders** | `POST` | `/api/v1/orders/:id/cancel`| Customer | Cancel order and restock inventory |
| **Orders** | `PUT` | `/api/v1/orders/:id/status`| Admin | Advance fulfillment state with audit notes |
| **Team Kits** | `POST` | `/api/v1/team-kits` | Customer | Submit custom jersey/kit request |
| **Team Kits** | `GET` | `/api/v1/team-kits/my-requests` | Customer | Track submitted custom team requests |
| **Coupons** | `POST` | `/api/v1/coupons/validate` | Customer | Validate coupon against cart subtotal |
| **Reviews** | `POST` | `/api/v1/reviews` | Customer | Submit review (requires verified delivered order)|
| **Payments** | `POST` | `/api/v1/payments/verify` | Customer | Verify Razorpay HMAC-SHA256 signature |

---

## 18. Authentication and Authorization
* **Session-Driven**: Server-side sessions maintained in MongoDB using `connect-mongo`.
* **Cookie Security**: `HttpOnly: true`, `SameSite: 'none'` (with HTTPS in production) / `'lax'` (development), and `Secure: true` in production.
* **Role-Based Guards**: Two-tier role model (`customer` vs `admin`). Administrative actions strictly require the `requireAdmin` middleware on the server regardless of client UI state.
* **CSRF Token Middleware**: State-mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) require a valid session CSRF token sent in the `X-CSRF-Token` header.

---

## 19. Testing Instructions

The platform includes **154 comprehensive automated tests** across **16 test files** (133 backend + 21 frontend), verifying 100% of critical paths including race conditions, multi-item inventory rollbacks, coupon ceilings, and variant integrity:

```bash
# Execute entire test suite
npm run test
```

### Backend Test Coverage Breakdown (`server/test/`)
* `health.test.js`: Infrastructure availability and database health checks.
* `auth.test.js`: Bcrypt cost factor, registration, session rotation, CSRF defense, rate-limiting.
* `products.test.js`: Catalog filtering, sorting, price overrides, pagination boundaries.
* `catalog.test.js`: Department schemas, variant SKU uniqueness, soft deactivation.
* `orders.test.js`: Cart operations, stock limits, COD checkout, order status lifecycle.
* `audit_concurrency.test.js`: Concurrent race conditions (two users buying last unit), multi-item reservation rollback, coupon rollback on failure, variant mismatch rejections, inactive product prevention, restock on cancellation.
* `features.test.js`: Budget Finder thresholds, coupon exhaustion, review purchase eligibility, explainable recommendations.
* `teamKit.test.js`: Team Kit 7-step builder, size breakdown calculations, quotation workflow, admin review.
* `payments.test.js`: Razorpay SDK initialization, cryptographic signature verification, tampering detection, webhook deduplication.
* `notifications.test.js`: Transactional emails, token links, queue retry logic, plain-text alternatives.
* `admin.test.js`: Admin dashboard metrics, qualifying sales calculations, order updates.

### Frontend Test Coverage Breakdown (`client/src/test/`)
* `formatters.test.js`: Authoritative currency formatting (paise to INR).
* `Badge.test.jsx`: Athletic brand token styling and status variants.
* `EmptyState.test.jsx`: Accessible empty state renders and CTA callbacks.
* `ProductCard.test.jsx`: Image fallbacks, stock status badges, department labels.
* `Header.test.jsx`: Responsive brand logos, department links, dynamic cart counters.

---

## 20. Deployment Instructions

### Frontend Deployment on Vercel
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set the **Root Directory** to `client`.
3. Framework preset will automatically detect **Vite**.
4. Configure the Environment Variable in Vercel Project Settings:
   * `VITE_API_URL`: `https://your-backend-service.onrender.com/api/v1`
5. The included [`client/vercel.json`](file:///c:/Users/Prathamesh/OneDrive/Desktop/My%20Projects/dypulse/client/vercel.json) automatically handles SPA route rewrites so refreshing `/orders`, `/shop`, or `/admin` routes works without 404 errors.
6. Click **Deploy**.

### Backend Deployment on Render (or equivalent Node.js Host)
1. In [Render Dashboard](https://dashboard.render.com), create a new **Web Service** or use the included [`render.yaml`](file:///c:/Users/Prathamesh/OneDrive/Desktop/My%20Projects/dypulse/render.yaml) blueprint.
2. Set **Root Directory** to `server`.
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Configure Environment Variables in Render:
   * `NODE_ENV`: `production`
   * `PORT`: `10000` (or host provided default)
   * `MONGODB_URI`: Your production MongoDB Atlas connection string (`mongodb+srv://...`)
   * `SESSION_SECRET`: A generated 64+ character random secret
   * `CORS_ORIGIN`: Your production Vercel frontend URL (e.g., `https://your-dypulse-app.vercel.app`)
   * `CLIENT_URL`: Your production Vercel frontend URL
   * `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: (Optional for CDN image storage)
   * `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: (Optional for test mode online payments)
6. Ensure your MongoDB Atlas Network Access whitelist includes `0.0.0.0/0` (or Render's outbound IP range).
7. Health check path: `/api/v1/health`.
8. Once deployed, run the one-time admin provisioning command via Render Shell or SSH:
   ```bash
   npm run create-admin -- --email=admin@yourdomain.com --password="YourSecurePassword@2026"
   ```

---

## 21. Security Considerations
* **Defense in Depth**: Frontend UI guards are treated purely as UX helpers; every API request is strictly verified server-side with session checks and role validation.
* **No Authoritative Client Money**: The client never passes totals or unit prices; line totals, discounts, and shipping charges are always calculated on the server.
* **Anti-Brute Force**: Express rate limiters protect authentication endpoints against credential stuffing.
* **Cryptographic Signatures**: Webhooks and payment verifications utilize `crypto.timingSafeEqual` with HMAC-SHA256 to eliminate timing vulnerabilities.
* **Safe Serialization**: Mongoose transforms ensure user password hashes, reset tokens, and verification secrets are stripped from JSON serialization.

---

## 22. Known Limitations
* **Local Image Fallback**: When Cloudinary credentials are not configured, uploaded product images are saved locally to `server/public/uploads`. In containerized cloud hosts with ephemeral disks (e.g., Render free tier), local uploads do not persist across instance restarts. *Resolution: Supply Cloudinary credentials for permanent CDN hosting.*
* **Email Provider**: The default `EMAIL_PROVIDER=mock` outputs transactional emails to the console rather than sending live emails. *Resolution: Configure SMTP credentials in production.*

---

## 23. Future Improvements
* **Real-Time Order Tracking**: WebSockets or Server-Sent Events (SSE) for live order tracking and kitchen/store fulfillment alerts.
* **Advanced Multi-College Subdomains**: Institutional sub-portals allowing specific colleges to have dedicated team stores and sports rosters.
* **Custom 3D Jersey Previewer**: Interactive Three.js/WebGL 3D jersey visualizer in the Team Kit Studio for real-time 360-degree rotation.
* **Automated Refund Webhooks**: Direct integration with Razorpay instant refund APIs for cancelled online orders.

---

## 24. Credits & Image Attribution
* **Design & Engineering**: Developed for university varsity athletes and campus lifestyle enthusiasts.
* **Design System**: Tailored with athletic varsity tokens inspired by modern sportswear culture.
* **Icons**: [Lucide Icons](https://lucide.dev) (Open-source ISC license).
* **Placeholder Assets**: Unsplash open-license sportswear and athletic gear photography.
