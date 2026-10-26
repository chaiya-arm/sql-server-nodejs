// app.js
// จุดเริ่มต้นของแอป: ตั้งค่า Express, ต่อ middleware, จับคู่ URL กับ routes แล้วเปิด server
// เหลือ 3 กลุ่ม: auth (JWT), protected (API Key), profiles (One-to-One user ↔ profile)

const express = require('express');   // เฟรมเวิร์กหลัก
const cors = require('cors');         // เปิดให้เว็บคนละ origin เรียก API ได้
const path = require('path');         // ช่วยจัดการ path ไฟล์แบบข้ามระบบปฏิบัติการ
require('dotenv').config();           // โหลดค่าใน .env เข้า process.env

const app = express();   // สร้างแอป Express 1 ตัว

// ===== CORS =====
// อ่านรายชื่อ origin ที่อนุญาตจาก .env (คั่นด้วย comma)
// ถ้าไม่ตั้งค่า ALLOWED_ORIGINS -> เปิดให้ทุก origin (สะดวกช่วงพัฒนา)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // ไม่มี origin (Postman/curl) หรือไม่ได้ตั้ง whitelist หรืออยู่ใน whitelist -> อนุญาต
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} ไม่ได้รับอนุญาตจาก CORS`));
  },
  credentials: true,   // อนุญาตให้ส่ง cookie / Authorization header ข้าม origin ได้
}));

app.use(express.json());   // แปลง body ที่เป็น JSON ให้กลายเป็น req.body อัตโนมัติ

// เปิดให้เข้าถึงไฟล์หน้าเว็บใน public/
app.use(express.static(path.join(__dirname, 'public')));

// ===== Routes: ผู้ใช้ =====
// สมัคร / ล็อกอิน / ดูข้อมูลตัวเอง (JWT)
app.use('/auth', require('./routes/auth'));

// กลุ่มที่ต้องผ่าน API Key — ต้องแนบ header x-api-key ทุก request  เช่น GET /api/secret
app.use('/api', require('./routes/protected'));

// โปรไฟล์ผู้ใช้ — ตัวอย่างความสัมพันธ์ One-to-One (user ↔ profile)
app.use('/profiles', require('./routes/profiles'));

// ===== Routes: ร้านค้า =====
app.use('/customers', require('./routes/customers'));   // One-to-Many  (→ invoices)
app.use('/products', require('./routes/products'));     // One-to-Many  (→ invoices)
app.use('/sellers', require('./routes/sellers'));       // One-to-Many  (→ invoices)
app.use('/invoices', require('./routes/invoices'));     // belongsTo    (→ customer/seller/product)

// health check ไว้เช็คว่า server ทำงาน (เปิด http://localhost:3000/ ดู)
app.get('/', (req, res) => {
    res.json({ success: true, message: 'API is running' });
});

// ตัวจัดการ error รวม (middleware ที่มี 4 พารามิเตอร์ = error handler)
app.use((err, req, res, next) => {
    return res.status(400).json({
        success: false,
        message: err.message,
        errors: null
    });
});

const PORT = process.env.PORT || 3000;   // ใช้พอร์ตจาก .env ถ้าไม่มีใช้ 3000

// เปิด server รอรับ request
app.listen(PORT, () => {
    console.log('Server Start on port ' + PORT);
});
