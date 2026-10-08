# 🍽️ Royal Spice - Full Stack Restaurant Website

A complete, responsive, and production-ready **Full-Stack Restaurant & Online Food Ordering System** built using **HTML5, CSS3, JavaScript (Frontend)** and **Node.js (Backend in JavaScript)**.

---

## 🌟 Key Features

1. **Frontend (HTML5 + CSS3 + Vanilla JavaScript)**:
   - **Modern Luxury UI**: Elegant restaurant design with warm culinary gold & slate palette.
   - **Interactive Menu**:
     - Category filters: *All, Starters, Main Course, Breads & Rice, Desserts, Beverages*.
     - Live dish search input.
     - Pure Vegetarian toggle filter.
     - Veg / Non-Veg food badges, ratings, and best-seller indicators.
   - **Cart & Online Ordering**:
     - Slide-out Cart Drawer.
     - Quantity increments, decrements, and item deletion.
     - Automatic calculation of Subtotal, GST (5%), Delivery fee, and Grand Total.
     - Checkout form (Name, Phone, Delivery address, Cash on Delivery / UPI).
     - LocalStorage persistence.
   - **Table Reservation System**:
     - Guests selection, Date & Time slot picker (Lunch & Dinner).
     - Seating options: AC Dining, Rooftop Skyline, Candlelight, VIP Hall.
     - Generates unique Table Booking ID (`TBL-XXXXX`).
   - **Customer Reviews & Testimonials**.
   - **Contact & Location Details**.

2. **Backend (Node.js REST API in JavaScript)**:
   - Built using **pure native Node.js** (`http`, `fs`, `path`, `url`).
   - **Zero external npm dependencies needed!** Works right out of the box with `node server.js` without any installation errors.
   - **File-based JSON Storage**:
     - `data/menu.json` - Dishes list.
     - `data/orders.json` - Saved food orders.
     - `data/reservations.json` - Saved table reservations.
   - **REST APIs**:
     - `GET /api/menu` - Fetch menu items.
     - `POST /api/orders` - Place food order.
     - `GET /api/orders` - View all orders.
     - `POST /api/reservations` - Book table.
     - `GET /api/reservations` - View all bookings.
     - `POST /api/contact` - Send message.
   - Built-in static file server serving all frontend assets with proper MIME types.

3. **Admin Management Dashboard**:
   - Access via the **"Admin Dashboard"** button in the top bar.
   - Live view of incoming online orders and table bookings with status badges.

---

## 📁 Project Structure

```text
restaurant-website/
├── package.json              # Project metadata & npm start script
├── server.js                 # Node.js backend server (REST API & static server)
├── README.md                 # Complete documentation & instructions
├── data/
│   ├── menu.json             # 12+ preloaded delicious dishes
│   ├── orders.json           # Stores placed food orders
│   └── reservations.json     # Stores table reservations
└── public/
    ├── index.html            # Main website page
    ├── style.css             # Responsive styling & animations
    └── app.js                # Frontend interactive logic & API calls
```

---

## 🚀 How to Run the Website (Step-by-Step)

### Step 1: Open Terminal / Command Prompt
Open PowerShell, CMD, or VS Code Terminal and navigate to the project directory:

```bash
cd "C:\Users\Jayesh Prajapati\.gemini\antigravity\scratch\restaurant-website"
```

### Step 2: Start the Node.js Server
Simply run:

```bash
node server.js
```
*(Or `npm start`)*

You will see:
```text
====================================================
🍽️  Restaurant Website Server is running!
🌐 Local URL: http://localhost:3000
📦 Node.js Backend Ready with REST APIs & Data Storage
====================================================
```

### Step 3: Open in Browser
Open your browser (Chrome, Edge, Firefox) and go to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 💡 How to Test All Features:
1. **Browse Menu**: Try filtering by categories (*Starters*, *Desserts*, etc.) or toggle the *Veg Only* switch.
2. **Add to Cart & Checkout**:
   - Click **Add** on dishes.
   - Click the **Cart** button in the navbar.
   - Click **Proceed to Checkout**, fill your details, and click **Confirm & Place Order**.
   - Your order will be stored in `data/orders.json`.
3. **Book a Table**:
   - Scroll to **Book a Table**, fill in your details and click **Confirm Table Reservation**.
   - Your reservation will be stored in `data/reservations.json`.
4. **Admin Panel**:
   - Click **Admin Dashboard** in the top bar to inspect your placed orders and reservations in real time!
