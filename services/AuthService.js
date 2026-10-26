// services/AuthService.js
// รวม logic การสมัครสมาชิก / เข้าสู่ระบบ ไว้ที่เดียว (ชั้นกฎเกณฑ์ธุรกิจ)
// Controller เรียกใช้ service, service คุยกับ model (ORM/Sequelize) + helper

const { User } = require('../orm');     // โมเดล User แบบ Sequelize
const Hash = require('../helpers/Hash'); // hash/เทียบรหัสผ่าน
const Jwt = require('../helpers/Jwt');   // สร้าง token

class AuthService {

    // สมัครสมาชิก: เช็คซ้ำ -> hash รหัสผ่าน -> บันทึก
    static async register(data) {

        // กันชื่อผู้ใช้ซ้ำ
        const existUser = await User.findOne({ where: { username: data.username } });
        if (existUser) {
            throw new Error('username นี้ถูกใช้แล้ว');
        }

        // กันอีเมลซ้ำ (เช็คเฉพาะเมื่อมีการส่ง email มา)
        if (data.email) {
            const existEmail = await User.findOne({ where: { email: data.email } });
            if (existEmail) {
                throw new Error('email นี้ถูกใช้แล้ว');
            }
        }

        // เข้ารหัสรหัสผ่านก่อนบันทึก ไม่เก็บ plain text
        const hashed = await Hash.make(data.password);

        const user = await User.create({
            username: data.username,
            password: hashed,        // เก็บ hash ไม่ใช่รหัสจริง
            fullname: data.fullname,
            email: data.email,
            phone: data.phone,
            status: 1                // เปิดใช้งานทันที
        });

        return { id: user.id, username: user.username };   // ไม่ส่งรหัสผ่านกลับ
    }

    // เข้าสู่ระบบ: หา user -> เทียบรหัส -> ออก token
    static async login(username, password) {

        const user = await User.findOne({ where: { username } });

        // ไม่บอกชัดว่าผิดที่ username หรือ password เพื่อความปลอดภัย (กันเดา)
        if (!user) {
            throw new Error('username หรือรหัสผ่านไม่ถูกต้อง');
        }

        // บัญชีถูกปิดใช้งาน
        if (user.status !== 1) {
            throw new Error('บัญชีนี้ถูกระงับการใช้งาน');
        }

        // เทียบรหัสที่กรอก กับ hash ใน DB
        const match = await Hash.compare(password, user.password);
        if (!match) {
            throw new Error('username หรือรหัสผ่านไม่ถูกต้อง');
        }

        // สร้าง token แนบข้อมูลที่ไม่ใช่ความลับ (ห้ามใส่ password ลง token)
        const token = Jwt.sign({ id: user.id, username: user.username });

        return {
            token: token,
            user: {
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                email: user.email
            }
        };
    }

    // ดึงข้อมูลโปรไฟล์ของผู้ใช้ที่ login อยู่ (จาก id ใน token)
    static async profile(userId) {

        // exclude password → ไม่ดึงรหัสผ่านออกมาเลย
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            throw new Error('ไม่พบผู้ใช้');
        }

        return user;
    }

}

module.exports = AuthService;
