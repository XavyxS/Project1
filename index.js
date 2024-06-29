require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

const saltRounds = 10;
const secretKey = process.env.SECRET_KEY;

app.use(bodyParser.json());
app.use(express.static('public'));  // Servir archivos estáticos desde la carpeta public

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

app.post('/add-user', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;

    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    connection.query(sql, [name, email, hash], (err, result) => {
      if (err) throw err;
      res.send('User added successfully!');
    });
  });
});

app.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  connection.query(sql, [email], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (!isMatch) {
        return res.status(401).send('Invalid email or password');
      }

      const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    });
  });
});

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).send('Access denied');
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

app.get('/users', authenticateJWT, (req, res) => {
  const sql = 'SELECT * FROM users';
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.put('/update-user/:id', authenticateJWT, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;

    const sql = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
    connection.query(sql, [name, email, hash, id], (err, result) => {
      if (err) throw err;
      res.send('User updated successfully!');
    });
  });
});

app.delete('/delete-user/:id', authenticateJWT, (req, res) => {
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
