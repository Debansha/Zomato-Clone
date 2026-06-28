# Zomato Clone

A full-stack, highly scalable food delivery platform inspired by Zomato. Built for a placement-level portfolio, this project features a modern architecture, robust APIs, real-time tracking, and a premium Next.js frontend UI.

## 🚀 Features

- **Multi-Role Authentication**: JWT-based auth for Customers, Restaurant Owners, Delivery Partners, and Admins.
- **Geospatial Queries**: Location-based restaurant discovery using MongoDB's `$geoNear`.
- **Complex Orders & Carts**: Cart validation, customized menu items, delivery fee calculations, and GST.
- **Payment Gateway**: Integrated with Razorpay for seamless online payments.
- **Real-Time Tracking**: Socket.IO powered live location tracking and order status updates.
- **Premium Frontend**: Next.js App Router with a bespoke Vanilla CSS design system (no Tailwind) simulating a premium UI.
- **Dashboards**: Dedicated dashboards for restaurant partners and a comprehensive Admin analytics panel.
- **API Documentation**: Automated Swagger API documentation.

## 🛠 Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- Zustand (Global State Management)
- Vanilla CSS (Custom Design System & CSS Modules)
- Axios & Socket.IO Client

### Backend
- Node.js & Express
- MongoDB (Mongoose) with 2dsphere indexing
- Redis (Caching & Rate Limiting)
- Socket.IO (WebSockets)
- JWT (Access & Refresh Tokens via httpOnly cookies)
- Joi (Request Validation)
- Cloudinary (Media Uploads)
- Razorpay (Payments)

## 📦 Project Structure
- `/client` - Next.js Frontend Application
- `/server` - Node.js/Express Backend API
- `/server/seed` - Database seeding scripts
- `docker-compose.yml` - Local development infrastructure

## 🚦 Getting Started

### Prerequisites
- Node.js v18+
- Docker & Docker Compose (for MongoDB and Redis)

### Running Locally
1. Start the infrastructure (MongoDB & Redis):
   ```bash
   docker-compose up -d
   ```

2. Start the Backend Server:
   ```bash
   cd server
   npm install
   cp .env.example .env # Fill in your credentials
   npm run seed # Seed the database
   npm run dev
   ```

3. Start the Frontend Application:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 📚 API Documentation
Start the backend server and navigate to `http://localhost:5000/api-docs` to view the full Swagger documentation.

## 🛡 License
This project is open-source and available under the MIT License.
