require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL!');
  createTables();
});

const createTables = () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  connection.query(createUsersTable, (err, results, fields) => {
    if (err) {
      console.error('Error creating users table:', err);
      return;
    }
    console.log('Users table created or already exists.');
  });
};

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/add-user', (req, res) => {
  const { name, email, password } = req.body;
  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  connection.query(sql, [name, email, password], (err, result) => {
    if (err) throw err;
    res.send('User added successfully!');
  });
});

app.get('/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.put('/update-user/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  const sql = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
  connection.query(sql, [name, email, password, id], (err, result) => {
    if (err) throw err;
    res.send('User updated successfully!');
  });
});

app.delete('/delete-user/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send('User deleted successfully!');
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
