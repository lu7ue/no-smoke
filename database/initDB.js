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
    await db.execAsync(`DROP TABLE IF EXISTS smoking_habits;`);
    await db.execAsync(`DROP TABLE IF EXISTS goals;`);

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

    // 创建吸烟习惯表（使用 price_per_cigarette）
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS smoking_habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            price_per_cigarette REAL,
            cigarettes_per_day INTEGER,
            currency TEXT CHECK(currency IN ('CNY', 'EUR')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 创建目标表
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            target_amount REAL NOT NULL,
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
            [0, 'username', ''],
        );
        console.log('Initial user created');
    }

    console.log('Database initialized successfully');
};

// 更新用户名
export const updateUserName = async (newName) => {
    const db = await getDatabase();
    await db.runAsync(
        'UPDATE users SET name = ? WHERE id = ?',
        [newName, 0] // 假设用户ID为0
    );
    return true;
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

// 保存吸烟习惯
export const saveSmokingHabits = async (habits) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM smoking_habits;');
    await db.runAsync(
        'INSERT INTO smoking_habits (price_per_cigarette, cigarettes_per_day, currency) VALUES (?, ?, ?)',
        [habits.pricePerCigarette, habits.cigarettesPerDay, habits.currency]
    );
    return true;
};

// 获取吸烟习惯
export const getSmokingHabits = async () => {
    const db = await getDatabase();
    const result = await db.getFirstAsync('SELECT * FROM smoking_habits LIMIT 1;');
    return result ? {
        id: result.id,
        price_per_cigarette: result.price_per_cigarette,
        cigarettes_per_day: result.cigarettes_per_day,
        currency: result.currency,
        created_at: result.created_at
    } : null;
};

// 保存目标
export const saveGoal = async (goal) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM goals;');
    await db.runAsync(
        'INSERT INTO goals (name, target_amount) VALUES (?, ?)',
        [goal.name, goal.targetAmount]
    );
    return true;
};

// 获取目标
export const getGoal = async () => {
    const db = await getDatabase();
    const result = await db.getFirstAsync('SELECT * FROM goals LIMIT 1;');
    return result ? {
        id: result.id,
        name: result.name,
        target_amount: result.target_amount,
        created_at: result.created_at
    } : null;
};