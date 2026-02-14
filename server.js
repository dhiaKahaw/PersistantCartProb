const express = require('express');
const cookieParser = require('cookie-parser');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

let db;

// 1. Initialize Database & Cleanup Mechanism
(async () => {
    db = await open({
        filename: './cart_database.db',
        driver: sqlite3.Database
    });

    // Create Table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS carts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            product_name TEXT,
            last_activity DATETIME
        )
    `);

    // AUTO-CLEANUP: Delete items older than 7 days every hour
    setInterval(async () => {
        await db.run("DELETE FROM carts WHERE last_activity < datetime('now', '-7 days')");
        console.log("Ran auto-cleanup for abandoned carts.");
    }, 3600000);
})();

// 2. Middleware: The "Identity Fixer"
// If a user doesn't have a session ID, we give them one that lasts 1 year.
app.use((req, res, next) => {
    let sessionId = req.cookies.cart_session;
    if (!sessionId) {
        sessionId = crypto.randomBytes(16).toString('hex');
        res.cookie('cart_session', sessionId, { maxAge: 31536000000, httpOnly: true });
    }
    req.sessionId = sessionId;
    next();
});

// 3. ROUTES
// GET CART: Retrieves items for the specific session
app.get('/api/cart', async (req, res) => {
    const items = await db.all("SELECT product_name FROM carts WHERE session_id = ?", [req.sessionId]);
    res.json(items);
});

// ADD TO CART: Saves to Database
app.post('/api/cart', async (req, res) => {
    const { product } = req.body;
    await db.run(
        "INSERT INTO carts (session_id, product_name, last_activity) VALUES (?, ?, datetime('now'))",
        [req.sessionId, product]
    );
    res.json({ status: "success" });
});

app.listen(3000, () => console.log('🛒 Shop live at http://localhost:3000'));