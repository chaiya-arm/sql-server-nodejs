// helpers/Jwt.js
// ห่อ jsonwebtoken ไว้สำหรับสร้าง / ตรวจสอบ token (ใช้ยืนยันตัวตนหลัง login)

const jwt = require('jsonwebtoken');
require('dotenv').config();

// คีย์ลับสำหรับเซ็น token — ต้องเก็บเป็นความลับ (|| ค่าสำรองไว้กันพังตอนลืมตั้ง .env)
const SECRET = process.env.JWT_SECRET || 'change_this_secret';
// อายุ token เช่น '1d' = 1 วัน, '2h' = 2 ชั่วโมง
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

class Jwt {

    // สร้าง token จาก payload (เช่น { id, username }) → คืนสตริง token
    static sign(payload) {

        return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

    }

    // ตรวจสอบ token ถ้าถูกต้องคืน payload ที่ถอดได้, ถ้าปลอม/หมดอายุจะ throw error
    static verify(token) {

        return jwt.verify(token, SECRET);

    }

}

module.exports = Jwt;
