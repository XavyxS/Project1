const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Compac1984',
  database: 'db_proj1'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL!');
});
