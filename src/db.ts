import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host: '127.0.0.1',      
    user: 'root',           
    password: 'mysql123', 
    database: 'iChat',   
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default db;
