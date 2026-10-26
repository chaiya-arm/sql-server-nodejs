// controllers/AuthController.js
// รับ request เรื่อง auth ส่งต่อให้ AuthService แล้วตอบกลับด้วยรูปแบบมาตรฐาน
// controller บาง — logic จริง (hash, เช็คซ้ำ, ออก token) อยู่ใน service

const AuthService = require('../services/AuthService'); // รวม logic การสมัคร/ล็อกอิน
const Response = require('../helpers/Response');

class AuthController {

    // POST /auth/register → สมัครสมาชิก
    static async register(req, res) {

        try {

            const result = await AuthService.register(req.body);   // ส่งทั้ง body ให้ service จัดการ

            return Response.success(res, result, 'สมัครสมาชิกสำเร็จ', 201);

        } catch (err) {

            // service จะ throw Error พร้อมข้อความ เช่น "username นี้ถูกใช้แล้ว"
            return Response.error(res, err.message, 400);

        }

    }

    // POST /auth/login → เข้าสู่ระบบ
    static async login(req, res) {

        try {

            const { username, password } = req.body;   // ดึง 2 ค่าออกจาก body

            const result = await AuthService.login(username, password);   // คืน token + ข้อมูล user

            return Response.success(res, result, 'เข้าสู่ระบบสำเร็จ');

        } catch (err) {

            return Response.error(res, err.message, 401);   // 401 = ยืนยันตัวตนไม่ผ่าน

        }

    }

    // GET /auth/me → ดูข้อมูลตัวเอง (ต้องแนบ token, ผ่าน AuthMiddleware ก่อน)
    static async me(req, res) {

        try {

            // req.user ถูกใส่โดย AuthMiddleware หลังถอดรหัส token สำเร็จ
            const result = await AuthService.profile(req.user.id);

            return Response.success(res, result);

        } catch (err) {

            return Response.error(res, err.message, 404);

        }

    }

}

module.exports = AuthController;
