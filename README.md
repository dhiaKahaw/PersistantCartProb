# 🛒 Persistent Cart App

A persistent shopping cart solution built with **Express.js** and **SQLite** that solves the critical problem of disappearing cart data in e-commerce platforms.

---

## The Problem

Users of an e-commerce platform face significant frustration because:

| Issue | Impact |
|---|---|
| **Cart lost on browser close** | Users add products, leave to think, and return to an empty cart |
| **Cart lost on server restart** | Server memory storage wipes all cart data on reboot |
| **No multi-user support** | Different browsers/devices can't maintain separate carts |
| **No cleanup mechanism** | Abandoned carts pile up with no expiration strategy |

These issues cause **high cart abandonment rates** and **lost sales**.

---

## How This App Solves Each Problem

### 1. 🌐 Browser Persistence — Cart survives browser close/reopen

When a user first visits the site, the server generates a unique session ID and stores it as a **cookie with a 1-year lifespan**. This cookie persists across browser sessions, so when the user returns, their cart is automatically restored.

> **Tech:** `cookie-parser` middleware + `crypto.randomBytes()` for secure session IDs.

### 2. 💾 Server Persistence — Cart survives server restarts

Cart data is stored in a **SQLite database file** (`cart_database.db`) on disk — not in volatile server memory. The database persists independently of the Node.js process, so restarting the server has zero impact on cart data.

> **Tech:** `sqlite` + `sqlite3` drivers writing to a local `.db` file.

### 3. 👥 Multi-User Support — Separate carts per browser/session

Each browser receives its own unique `cart_session` cookie. All API operations (`GET /api/cart`, `POST /api/cart`) are scoped to the requesting user's session ID, ensuring complete isolation between users.

### 4. 🧹 Auto-Cleanup — Expired items removed after 7 days

A background job runs **every hour** and deletes any cart item whose `last_activity` timestamp is older than 7 days. This prevents the database from growing indefinitely with abandoned cart data.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite (file-based, zero-config)
- **Session Tracking:** HTTP cookies (`cookie-parser`)
- **Frontend:** Vanilla HTML/CSS/JS

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd persistent-cart-app

# 2. Install dependencies
npm install
```

### Running the App

```bash
node server.js
```

The server will start and you'll see:

```
🛒 Shop live at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

---

## Project Structure

```
persistent-cart-app/
├── server.js            # Express server, API routes, DB init & cleanup
├── public/
│   └── index.html       # Frontend UI (store + cart display)
├── cart_database.db     # SQLite database (auto-created on first run)
├── package.json         # Project metadata & dependencies
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cart` | Retrieve all cart items for the current session |
| `POST` | `/api/cart` | Add a product to the cart (`{ "product": "name" }`) |

### Example

```bash
# Add an item
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"product": "Laptop"}'

# Get cart contents
curl http://localhost:3000/api/cart
```

---



## License

ISC
