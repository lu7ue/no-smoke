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
    try {
        await db.execAsync(`PRAGMA journal_mode = WAL;`);

        // 删除旧表（仅限开发阶段使用）
        await db.execAsync(`DROP TABLE IF EXISTS quit_dates;`);
        await db.execAsync(`DROP TABLE IF EXISTS smoking_habits;`);
        await db.execAsync(`DROP TABLE IF EXISTS goals;`);
        await db.execAsync(`DROP TABLE IF EXISTS users;`);

        // 创建用户表
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

        // 创建吸烟习惯表
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

        // 检查并插入默认用户
        const existingUsers = await db.getAllAsync('SELECT * FROM users');
        if (existingUsers.length === 0) {
            await db.runAsync(
                `INSERT INTO users (name, avatar) VALUES (?, ?)`,
                ['username', '']
            );
        }

        // 检查并设置默认戒烟时间
        const existingQuitDates = await db.getAllAsync('SELECT * FROM quit_dates');
        if (existingQuitDates.length === 0) {
            await db.runAsync(
                'INSERT INTO quit_dates (quit_date) VALUES (?)',
                [new Date().toISOString()]
            );
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

// 用户相关操作
export const updateUserName = async (newName) => {
    const db = await getDatabase();
    await db.runAsync('UPDATE users SET name = ? WHERE id = 1', [newName]);
    return true;
};

// 戒烟日期相关操作
export const saveQuitDate = async (date) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM quit_dates;');
    await db.runAsync(
        'INSERT INTO quit_dates (quit_date) VALUES (?);',
        [date.toISOString()]
    );
    return true;
};

export const getQuitDate = async () => {
    const db = await getDatabase();
    try {
        const result = await db.getFirstAsync('SELECT quit_date FROM quit_dates ORDER BY created_at DESC LIMIT 1;');
        return result ? new Date(result.quit_date) : null;
    } catch (error) {
        console.error('Error getting quit date:', error);
        return null;
    }
};

export const saveSmokingHabits = async (habits) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM smoking_habits;');
    await db.runAsync(
        'INSERT INTO smoking_habits (price_per_cigarette, cigarettes_per_day, currency) VALUES (?, ?, ?)',
        [habits.price_per_cigarette, habits.cigarettes_per_day, habits.currency]
    );
    return true;
};

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

export const saveGoal = async (goal) => {
    const db = await getDatabase();
    try {
        await db.runAsync('DELETE FROM goals;');

        // 验证目标数据
        if (!goal.name || goal.target_amount == null || isNaN(goal.target_amount)) {
            throw new Error('无效的目标数据');
        }

        await db.runAsync(
            'INSERT INTO goals (name, target_amount) VALUES (?, ?)',
            [goal.name, goal.target_amount]
        );
        return true;
    } catch (error) {
        console.error('保存目标失败:', error);
        throw error; // 重新抛出错误以便上层处理
    }
};

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