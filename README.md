# 🌾 AgriMarket

A full-stack agricultural marketplace that enables users to buy and sell agricultural products while providing supporting services such as market prices, crop information, weather forecasts, and farming risk insights.

<div align="center">

| **🌐 Live Demo** | **📚 API Documentation** |
|:---:|:---:|
| [**AgriMarket Website**](https://agrimarket-website.netlify.app/) | [**API Health Check**](http://localhost:8080/api/health) |

</div>

---

## 📌 Overview

AgriMarket is a full-stack, production-grade agricultural marketplace built with a modern **TypeScript, Node.js, Express, React, and PostgreSQL** stack. It supports end-to-end product and inventory management, ordering, checkout, payments, OTP-based delivery tracking, admin governance, mandi market prices, crop information encyclopedia, Open-Meteo weather forecasts, automated farming risk calculations, and geographic location services.

The application uses **JWT/OAuth2 double-transport authentication (HTTP-only cookies + Bearer tokens), automated database migrations (V1–V42), Docker containerization, Vitest end-to-end test suites, and GitHub Actions CI/CD pipeline**.

---

## ✨ Key Features

### 🔐 Authentication & Account Management
- User registration and login with strict validation
- JWT access tokens (15m–24h) and secure refresh token rotation (7d)
- Double-transport auth: HTTP-only cookies and `Authorization: Bearer` support
- SHA-256 session token hashing (`refresh_token_sessions`)
- Login attempt protection: 5 failed attempts trigger an automatic 15-minute account lock
- Email verification and password reset workflows
- Role-based authorization (`USER`, `ADMIN`)

### 🌾 Product Marketplace & Inventory
- Full marketplace catalog with search, price filters, category filters, and pagination
- Product location snapshots with taluk, district, and coordinate pins
- Multi-image management with Cloudinary integration & fallback
- Primary photo protection (must maintain at least one valid produce photo)
- Strict inventory stock reservations during checkout and automatic deduction upon delivery

### 🛒 Orders, Payments & Consignment Delivery
- Multi-item checkout workflow with shipping address snapshots
- State-machine order transitions (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED` / `CANCELLED`)
- Mock and external payment provider support with transaction tracking and refunds
- Consignment tracking with 6-digit OTP generation and cryptographically verified delivery confirmation

### 🌦️ Weather & Deterministic Farming Risk Engine
- Open-Meteo 7-day weather forecasting
- Deterministic multi-factor agronomic risk calculator:
  - Rainfall waterlogging risk
  - Wind lodging & canopy risk
  - Heat & thermal stress
  - Solar UV irradiation
  - Chemical spraying feasibility window
  - Soil evapotranspiration (ET0) & irrigation demand

### 📊 Market Prices & Crop Encyclopedia
- **Real-Time Mandi Rates**: Direct integration with government APMC Mandi price feeds (`https://mandi-api.onrender.com/v1/prices`) returning live modal, minimum, and maximum arrival prices across Karnataka, Maharashtra, Uttar Pradesh, Punjab, and Madhya Pradesh, backed by database caching and local fallback.
- **Crop Encyclopedia**: Searchable agricultural encyclopedia covering scientific names, optimal climate ranges, water requirements, common crop diseases, and commercial uses.

---

## 🚀 Deployment Options

### Option 1: Docker Compose (1-Command Full Production Stack)
A complete containerized production environment with PostgreSQL 16, Node.js backend, and Nginx SPA frontend:

```bash
# From the repository root:
docker compose up --build -d
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
- Health check: `http://localhost:8080/api/health`

### Option 2: Render Blueprint (Cloud Deployment)
The repository includes a ready-to-use [`render.yaml`](file:///c:/Users/Tharun%20R%20Gowda/Desktop/DBMS/agriMarket/render.yaml) Blueprint:
1. Push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com/), click **New** → **Blueprint**.
3. Select your repository. Render automatically provisions:
   - Managed PostgreSQL database (`agrimarket-db`)
   - Node.js 22 Backend Web Service (`agrimarket-backend`)
   - Static React SPA Frontend (`agrimarket-frontend`)

### Option 3: Netlify / Vercel (Frontend) + Render / Railway (Backend)
- **Frontend on Netlify / Vercel**: Connect your repo, set root directory to `frontend`, build command `npm run build`, and publish directory `dist`. SPA client-side routing is configured via [`_redirects`](file:///c:/Users/Tharun%20R%20Gowda/Desktop/DBMS/agriMarket/frontend/public/_redirects) and [`vercel.json`](file:///c:/Users/Tharun%20R%20Gowda/Desktop/DBMS/agriMarket/frontend/vercel.json).
- Set `VITE_API_BASE_URL` in frontend environment variables to your deployed backend URL.

---

## 🧪 Running Tests

```bash
cd backend
npm test
```
All 19 integration tests pass, covering authentication, profile management, marketplace queries, inventory validation, weather calculations, real-time APMC Mandi prices, checkout, delivery OTP, and administrative governance.


---

## 🤝 Contributing & License

Contributions are welcome! Please submit a PR following the modular architecture.
Licensed under the MIT License.
