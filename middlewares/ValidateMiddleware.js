// middlewares/ValidateMiddleware.js
// ตรวจสอบว่ามี field ที่จำเป็นครบใน req.body หรือไม่
// วิธีใช้: router.post('/', validate(['username','password']), Controller.store)

const Response = require('../helpers/Response');

// นี่คือ "ฟังก์ชันที่คืนฟังก์ชัน" (higher-order): รับรายชื่อ field ที่ต้องมี แล้วคืน middleware จริงออกไป
module.exports = function (requiredFields = []) {

    // ตัวที่คืนออกไปนี้แหละคือ middleware ที่ Express เรียก (req, res, next)
    return function (req, res, next) {

        const missing = [];   // เก็บชื่อ field ที่ขาด

        for (const field of requiredFields) {

            const value = req.body[field];   // ค่าของ field นั้นใน body

            // ถือว่า "ขาด" ถ้าไม่ส่งมา (undefined), เป็น null, หรือเป็นสตริงว่าง
            if (value === undefined || value === null || value === '') {
                missing.push(field);
            }

        }

        if (missing.length > 0) {
            // มีอย่างน้อย 1 field ขาด → ตอบ 422 พร้อมบอกว่าขาดตัวไหนบ้าง
            return Response.error(
                res,
                'ข้อมูลไม่ครบ',
                422,
                { missing: missing }
            );
        }

        next();   // ครบทุก field → ไปต่อ

    };

};
