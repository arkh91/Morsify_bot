// db.js
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Test',
    database: 'Morsify',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

connection.connect((err) => {

    if (err) {
        console.error('❌ MySQL Connection Error:', err);
        return;
    }

    console.log('✅ Connected to MySQL');
});

module.exports = connection;

