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
    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    // 删除旧表（仅限开发阶段使用）
    await db.execAsync(`DROP TABLE IF EXISTS users;`);

    // 重新创建表
    // 虽然写了avatar属性 实际上并没在profile.tsx使用它来读取数据
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            avatar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Check if we already have users (to avoid duplicates)
    const existingUsers = await db.getAllAsync('SELECT * FROM users');
    
    // Insert initial user if table is empty
    // avatar的默认值写成default 是为了在constants文件[images.ts]中通过键找值 但实际上 暂时还没有使用它
    if (existingUsers.length === 0) {
        await db.runAsync(
            `INSERT INTO users (id, name, avatar) 
            VALUES (?, ?, ?)`,
            [0, 'username', 'default'],
        );
        
        console.log('Initial user created');
    }
    
    console.log('Database initialized successfully');

};
