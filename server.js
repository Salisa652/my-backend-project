const http = require('http');
const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

// เชื่อมต่อกับฐานข้อมูล TiDB
let cer_part = path.join(process.cwd(), 'isrgrootx1.pem');

const connection = mysql.createConnection({
    host: 'gateway01.us-west-2.prod.aws.tidbcloud.com',
    user: '3ccLZf87dpk3xmL.root',  // ใช้ชื่อผู้ใช้ที่ถูกต้อง
    password: 'qp3Ij98VWEpzSlm6',  // ใช้รหัสผ่านที่ถูกต้อง
    database: 'github_sample',
    port: 4000,
    ssl: {
      ca: fs.readFileSync(cer_part),
    }
  });
  

app.use(cors());
app.use(express.json());
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// หน้าเริ่มต้น API
app.get('/', (req, res) => {
  res.json({
    "Name": "Heart Surgery Recovery Tracking System",
    "Author": "Your Name",
    "APIs": [
      { "api_name": "/getRecoveryData/", "method": "get" },
      { "api_name": "/getRecoveryData/:id", "method": "get" },
      { "api_name": "/addRecoveryData/", "method": "post" },
      { "api_name": "/updateRecoveryData/", "method": "put" },
      { "api_name": "/deleteRecoveryData/", "method": "delete" },
    ]
  });
});

// API สำหรับดึงข้อมูลการฟื้นตัวหลังผ่าตัดทั้งหมด
app.get('/getRecoveryData/', (req, res) => {
  let sql = 'SELECT * FROM recovery_data';
  connection.query(sql, function (err, results, fields) {
    res.json(results);
  });
});

// API สำหรับดึงข้อมูลการฟื้นตัวหลังผ่าตัดตาม ID
app.get('/getRecoveryData/:id', (req, res) => {
  let id = req.params.id;
  let sql = 'SELECT * FROM recovery_data WHERE id = ?';
  connection.query(sql, [id], function (err, results, fields) {
    res.json(results);
  });
});

// API สำหรับเพิ่มข้อมูลการฟื้นตัวหลังผ่าตัด
app.post('/addRecoveryData', urlencodedParser, (req, res) => {
  let sql = 'INSERT INTO recovery_data(patient_name, symptoms, medication, blood_pressure, heart_rate, recovery_status, surgery_date, follow_up_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  let values = [req.body.patient_name, req.body.symptoms, req.body.medication, req.body.blood_pressure, req.body.heart_rate, req.body.recovery_status, req.body.surgery_date, req.body.follow_up_date];
  let message = "Cannot Insert";

  connection.query(sql, values, function (err, results, fields) {
    if (results) {
      message = "Inserted";
    }
    res.json({ error: false, data: results, msg: message });
  });
});

// API สำหรับอัปเดตข้อมูลการฟื้นตัวหลังผ่าตัด
app.put('/updateRecoveryData', urlencodedParser, (req, res) => {
  let sql = 'UPDATE recovery_data SET patient_name = ?, symptoms = ?, medication = ?, blood_pressure = ?, heart_rate = ?, recovery_status = ?, surgery_date = ?, follow_up_date = ? WHERE id = ?';
  let values = [req.body.patient_name, req.body.symptoms, req.body.medication, req.body.blood_pressure, req.body.heart_rate, req.body.recovery_status, req.body.surgery_date, req.body.follow_up_date, req.body.id];
  let message = "Cannot Update";

  connection.query(sql, values, function (err, results, fields) {
    if (results) {
      message = "Updated";
    }
    res.json({ error: false, data: results, msg: message });
  });
});

// API สำหรับลบข้อมูลการฟื้นตัวหลังผ่าตัด
app.delete('/deleteRecoveryData', urlencodedParser, (req, res) => {
  let sql = 'DELETE FROM recovery_data WHERE id = ?';
  let values = [req.body.id];
  let message = "Cannot Delete";

  connection.query(sql, values, function (err, results, fields) {
    if (results) {
      message = "Deleted";
    }
    res.json({ error: false, data: results, msg: message });
  });
});
