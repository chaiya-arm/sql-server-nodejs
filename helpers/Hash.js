// helpers/Hash.js
// ห่อ bcrypt ไว้ใช้ hash / เทียบรหัสผ่าน (รองรับ hash เดิมในฐานข้อมูลที่เป็น $2b$10$...)
// เก็บรหัสผ่านเป็น hash เสมอ ไม่เก็บ plain text เพื่อความปลอดภัย

const bcrypt = require('bcryptjs');

// จำนวนรอบการ "ใส่เกลือ" ยิ่งมากยิ่งปลอดภัยแต่ช้าลง (10 คือค่ามาตรฐานที่นิยม)
const SALT_ROUNDS = 10;

class Hash {

    // เข้ารหัสรหัสผ่านก่อนบันทึกลงฐานข้อมูล (plain → hash)
    static async make(plain) {

        return await bcrypt.hash(plain, SALT_ROUNDS);

    }

    // เทียบรหัสผ่านที่ผู้ใช้กรอก กับ hash ในฐานข้อมูล → คืน true/false
    static async compare(plain, hash) {

        if (!hash) return false;   // ไม่มี hash ให้เทียบ ถือว่าไม่ผ่าน (กัน error)

        return await bcrypt.compare(plain, hash);

    }

}

module.exports = Hash;
