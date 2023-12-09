const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');


const app = express();
const port = 3001;

// Connect to your MySQL database
const db = mysql.createConnection({
  host: 'ec2-13-48-43-27.eu-north-1.compute.amazonaws.com',
  user: 'shreyansh',
  password: 'S12ikhar$',
  database: 'login',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.use(cors());
// Middleware to parse JSON requests
app.use(bodyParser.json());

// Define your API endpoint to handle form submissions
app.post('/api/submitSignUpForm', (req, res) => {
  const formData = req.body;

  const hashedPassword = crypto.createHash('sha256').update(formData.password).digest('hex');

  const sql = 'SELECT count(*) AS count1 FROM logindetails WHERE (email = ? OR username = ?)';
  const values = [formData.email, formData.username];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting into database:', err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    } else {
      if (result[0].count1 > 0) {
        res.status(401).json({ success: false, message: 'username or email already taken!' });
      }
      else {
        const sql1 = 'INSERT INTO logindetails (username, email, password) VALUES (?, ?, ?)';
        const values1 = [formData.username, formData.email, hashedPassword];

        db.query(sql1, values1, (err, result) => {
          if (err) {
            console.error('Error inserting into database:', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
          } else {
            console.log('Data inserted into database');
            res.json({ success: true, message: 'Form submitted successfully' });
          }
        });
      }
    }
  });

});


app.post('/api/submitSignInForm', (req, res) => {
  const formData = req.body;

  const hashedPassword = crypto.createHash('sha256').update(formData.password).digest('hex');

  const sql = 'SELECT count(*) AS count1 FROM logindetails WHERE (email = ? OR username = ?) AND password = ?';
  const values = [formData.emailUsername, formData.emailUsername, hashedPassword];


  db.query(sql, values, (err, results) => {


    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    } else {
      if (results[0].count1 == 1) {
        // User found, login successful
        res.json({ success: true, message: 'Login successful' });
      } else {
        // User not found or password mismatch
        res.status(401).json({ success: false, message: 'Invalid email/username or password' });
      }
    }
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
