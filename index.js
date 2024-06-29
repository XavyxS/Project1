require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const readline = require('readline');
const app = express();
const port = 3000;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);

  // Verificar la conexión con una consulta simple
  connection.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);

    // Pausar hasta que se presione una tecla
    rl.question('Press any key to continue...', (answer) => {
      rl.close();

      // Continuar con la ejecución del servidor
      app.get('/', (req, res) => {
        res.send('Hello World!');
      });

      app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
      });
    });
  });
});
