import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export const getDatabase = async () => {
    if (!dbInstance) {
        dbInstance = await SQLite.openDatabaseAsync('nosmoke.db');
        await initializeDatabase(dbInstance);
    }
    return dbInstance;
};

const initializeDatabase = async (db) => {
    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    // 删除旧表（仅限开发阶段使用）
    await db.execAsync(`DROP TABLE IF EXISTS users;`);
    await db.execAsync(`DROP TABLE IF EXISTS quit_dates;`);

    // 重新创建表
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            avatar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 创建戒烟日期表
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS quit_dates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quit_date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 检查是否已有用户数据
    const existingUsers = await db.getAllAsync('SELECT * FROM users');

    // 插入初始用户
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

// 保存戒烟日期
export const saveQuitDate = async (date) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM quit_dates;'); // 清空旧数据
    await db.runAsync(
        'INSERT INTO quit_dates (quit_date) VALUES (?);',
        [date.toISOString()]
    );
    return true;
};

// 获取戒烟日期
export const getQuitDate = async () => {
    const db = await getDatabase();
    const result = await db.getFirstAsync('SELECT quit_date FROM quit_dates ORDER BY created_at DESC LIMIT 1;');
    return result ? new Date(result.quit_date) : null;
};