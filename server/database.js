const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, 'allsnax.db');
        this.db = new sqlite3.Database(this.dbPath);
        this.init();
    }

    init() {
        // Create tables
        this.db.serialize(() => {
            // Reviews table
            this.db.run(`CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                rating INTEGER NOT NULL,
                review_text TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'approved'
            )`);

            // Subscriptions table
            this.db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active'
            )`);

            // File operations log
            this.db.run(`CREATE TABLE IF NOT EXISTS file_operations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operation_type TEXT NOT NULL,
                file_name TEXT NOT NULL,
                file_size INTEGER,
                user_ip TEXT,
                status TEXT DEFAULT 'completed',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            console.log('Database initialized successfully');
        });
    }

    // Reviews methods
    addReview(name, rating, reviewText) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare("INSERT INTO reviews (name, rating, review_text) VALUES (?, ?, ?)");
            stmt.run([name, rating, reviewText], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
            stmt.finalize();
        });
    }

    getReviews(limit = 10) {
        return new Promise((resolve, reject) => {
            this.db.all(
                "SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT ?",
                [limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    // Subscriptions methods
    addSubscription(email) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare("INSERT OR IGNORE INTO subscriptions (email) VALUES (?)");
            stmt.run([email], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
            stmt.finalize();
        });
    }

    // File operations methods
    logFileOperation(operationType, fileName, fileSize, userIp) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare("INSERT INTO file_operations (operation_type, file_name, file_size, user_ip) VALUES (?, ?, ?, ?)");
            stmt.run([operationType, fileName, fileSize, userIp], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
            stmt.finalize();
        });
    }

    getStats() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    (SELECT COUNT(*) FROM file_operations) as total_operations,
                    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as total_subscriptions,
                    (SELECT COUNT(*) FROM reviews WHERE status = 'approved') as total_reviews
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = Database;