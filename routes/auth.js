// routes/auth.js
// เส้นทางกลุ่ม "ไม่ต้องใช้ API Key" — สมัคร / ล็อกอิน เปิดให้ทุกคนเข้าถึง
// ส่วน /me ต้องแนบ JWT token (ผ่าน AuthMiddleware)

const express = require('express');
const router = express.Router();   // Router = กล่องรวมเส้นทางย่อย เอาไป mount ที่ app.js

const AuthController = require('../controllers/AuthController');
const validate = require('../middlewares/ValidateMiddleware');   // ตัวเช็ค field ครบ
const auth = require('../middlewares/AuthMiddleware');            // ตัวเช็ค token

// รูปแบบ: router.METHOD(path, [middleware...], handler)
// middleware จะทำงานก่อน handler (controller) เสมอ

// สมัครสมาชิก — ต้องมี username, password (validate เช็คก่อน ถ้าขาดจะตอบ 422 ไม่ถึง controller)
router.post('/register', validate(['username', 'password']), AuthController.register);

// เข้าสู่ระบบ — ต้องมี username, password
router.post('/login', validate(['username', 'password']), AuthController.login);

// ดูข้อมูลตัวเอง — ต้องมี token (auth เช็คก่อน ถ้าไม่ผ่านตอบ 401)
router.get('/me', auth, AuthController.me);

module.exports = router;   // ส่ง router ออกไปให้ app.js เอาไป app.use('/auth', ...)
