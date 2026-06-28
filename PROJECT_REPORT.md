# Zomato Clone - Complete Project Report

## 1. Project Overview
This project is an advanced, full-stack web application designed to replicate the core functionalities of Zomato, a leading food delivery and restaurant discovery platform. 

It was built as a "placement-level" portfolio project to demonstrate mastery of modern web architecture, including real-time WebSockets, complex database relationships, payment gateway integration, and a highly responsive, premium user interface.

---

## 2. Technology Stack
The project utilizes the **MERN** stack (modified to use Next.js instead of plain React) along with several enterprise-grade tools:

### Frontend (Client)
*   **Framework**: Next.js 15 (App Router)
*   **Library**: React 19
*   **State Management**: Zustand (for global Cart and Authentication state)
*   **Styling**: Pure Vanilla CSS and CSS Modules (No Tailwind, demonstrating deep CSS architectural skills)
*   **API Client**: Axios with Interceptors (for automatic token refresh)
*   **Real-time**: Socket.IO-client

### Backend (Server)
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (via Mongoose)
*   **Caching & Sessions**: Redis
*   **Authentication**: JSON Web Tokens (JWT) using secure, HTTPOnly Cookies
*   **Real-time**: Socket.IO (for live order tracking)
*   **Payments**: Razorpay API
*   **File Uploads**: Cloudinary & Multer

---

## 3. Project Architecture & Folder Structure

The project is split into two completely separate repositories/folders to simulate a Microservice-like decoupling: the **Client** (Frontend) and the **Server** (Backend API).

### A. The `/server` Folder (Backend)
The backend uses a **Modular Monolithic Architecture**. Instead of lumping all controllers and routes together, features are isolated into their own modules.

*   **`src/config/`**: Contains configurations for MongoDB, Redis, Cloudinary, and Environment Variables.
*   **`src/middleware/`**: Contains custom logic that intercepts requests:
    *   `auth.js`: Verifies JWT tokens and checks user roles (e.g., stopping a Customer from accessing an Admin route).
    *   `errorHandler.js`: Catches errors globally to prevent the server from crashing.
    *   `rateLimiter.js`: Prevents DDoS attacks by limiting how many requests a user can make.
*   **`src/modules/`**: The core business logic, divided by feature:
    *   **Auth**: Handles Registration, Login, and Token Refreshing.
    *   **Restaurant**: Manages restaurant profiles and `$geoNear` spatial queries (finding restaurants near a user's latitude/longitude).
    *   **Menu**: Handles dishes, categories, and customizations.
    *   **Cart**: Manages user carts safely.
    *   **Order & Payment**: Calculates subtotal, GST, Delivery fees, and integrates Razorpay for checkout.
    *   **Delivery**: Tracks delivery partner live coordinates.
    *   **Admin**: Analytical queries returning data for revenue graphs and user tracking.
*   **`src/socket/`**: Manages WebSockets. When a delivery partner moves, this pushes their exact GPS coordinates to the specific Customer's browser in real-time without refreshing the page.

### B. The `/client` Folder (Frontend)
The frontend uses the latest Next.js App Router for optimal SEO and performance.

*   **`src/app/`**: Contains the page routes. Next.js uses file-based routing.
    *   `page.js`: The Homepage.
    *   `search/page.js`: The restaurant listing and filtering page.
    *   `restaurant/[slug]/page.js`: Dynamic routing for specific restaurants, fetching their unique menus.
    *   `cart/page.js`: The secure checkout flow.
    *   `dashboard/page.js`: The centralized hub for restaurant owners to accept orders and manage menus.
*   **`src/components/`**: Reusable UI blocks like `RestaurantCard` and `MenuItemCard` to keep the code DRY (Don't Repeat Yourself).
*   **`src/lib/api.js`**: A centralized Axios configuration that automatically injects the user's secure token into every request sent to the backend.
*   **`src/store/`**: Global state management using Zustand. This ensures that if you add an item to your cart on one page, the cart icon on the navigation bar updates instantly across the entire app.

---

## 4. Key Advanced Features (For Interview Discussion)

When presenting this project to professors or recruiters, highlight these specific engineering achievements:

1.  **Security (JWT & HTTP-Only Cookies)**:
    Instead of simply sending a token to the frontend (which is vulnerable to XSS attacks), the backend issues two tokens: a short-lived Access Token, and a long-lived Refresh Token hidden in an encrypted cookie. The Axios interceptor automatically uses the refresh token to get a new access token when it expires.
2.  **Geospatial Searching**:
    The database uses MongoDB's special `2dsphere` indexes. Instead of loading all restaurants, the backend uses advanced math (`$geoNear`) to only query restaurants within a 10km radius of the user's exact GPS coordinates.
3.  **Real-Time Architecture**:
    HTTP requests are "one-way" (Client asks, Server responds). To build live tracking, the app uses Socket.IO. The server holds a persistent connection open with the client, allowing the server to push status updates ("Your food is preparing!") the millisecond a restaurant owner clicks a button.
4.  **Complex Data Aggregation**:
    The admin dashboard doesn't just do simple `SELECT *` queries. It uses MongoDB Aggregation Pipelines to group sales by day, calculate total platform revenue, and sort the most popular cuisines based on historical order data.

---

## 5. How to Run the Project
1. Open the project root folder.
2. Double-click the `start.bat` file.
3. This script will automatically boot Docker (Database), the Node API, and the Next.js Client in separate windows.
4. Open `http://localhost:3000` in your browser.
