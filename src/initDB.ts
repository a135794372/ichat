import db from './db';

async function createTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS test (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    try {
        await db.query(sql);
        console.log('✅ users 資料表建立成功');
    } catch (error) {
        console.error('❌ 建立資料表時發生錯誤:', error);
    }
    process.exit();
}

createTable();
