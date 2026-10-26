// middlewares/AuthMiddleware.js
// ตรวจสอบ JWT token จาก header "Authorization: Bearer <token>"
// ถ้าผ่านจะแนบข้อมูลผู้ใช้ไว้ที่ req.user ให้ controller เอาไปใช้ต่อ

const Jwt = require('../helpers/Jwt');           // ตัวถอด/ตรวจ token
const Response = require('../helpers/Response');

module.exports = function (req, res, next) {

    const header = req.headers['authorization'] || '';   // เช่น "Bearer eyJhbG..." (|| '' กัน undefined)

    // ถ้าขึ้นต้นด้วย "Bearer " ให้ตัด 7 ตัวหน้าออก เหลือเฉพาะ token, ไม่งั้นเป็น null
    const token = header.startsWith('Bearer ')
        ? header.slice(7)
        : null;

    if (!token) {
        return Response.error(res, 'ต้องเข้าสู่ระบบก่อน (ไม่พบ token)', 401);
    }

    try {

        const decoded = Jwt.verify(token);   // ถ้า token ปลอม/หมดอายุ จะ throw ตกไป catch

        req.user = decoded;   // แนบข้อมูลใน token (เช่น { id, username }) ไว้ที่ req.user

        next();               // ผ่าน → ไป controller

    } catch (err) {

        return Response.error(res, 'token ไม่ถูกต้องหรือหมดอายุ', 401);

    }

};
