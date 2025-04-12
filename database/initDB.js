import * as SQLite from 'expo-sqlite';

// Open or create the database
let dbInstance = null;

export const getDatabase = async () => {
    if (!dbInstance) {
        dbInstance = await SQLite.openDatabaseAsync('nosmoke.db');
        await initializeDatabase(dbInstance);
    }
    return dbInstance;
};

// Initialize the database with tables
const initializeDatabase = async (db) => {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            avatar TEXT,
            start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            target_days INTEGER NOT NULL,
            current_streak INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Check if we already have users (to avoid duplicates)
    const existingUsers = await db.getAllAsync('SELECT * FROM users');
    
    // Insert initial user if table is empty
    if (existingUsers.length === 0) {
        await db.runAsync(
            `INSERT INTO users (name, avatar, target_days, current_streak) 
            VALUES (?, ?, ?, ?)`,
            ['User1', null, 30, 0]
        );
        
        console.log('Initial user created');
    }
    
    console.log('Database initialized successfully');

};
