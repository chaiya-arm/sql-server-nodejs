// middlewares/ApiKeyMiddleware.js
// ตรวจสอบ "API Key ของระบบ" จาก header "x-api-key" เทียบกับค่า API_KEY ใน .env
// ใช้กับ route กลุ่ม protected ที่อยากให้เฉพาะ client ที่รู้กุญแจเท่านั้นเรียกได้
// ต่างจาก AuthMiddleware (JWT) ตรงที่อันนี้เป็นกุญแจระดับ "ระบบ/แอป" ไม่ใช่ของผู้ใช้รายคน

const Response = require('../helpers/Response');

module.exports = function (req, res, next) {

    // รองรับทั้ง header "x-api-key" และแบบ "Authorization: ApiKey <คีย์>" เผื่อ client บางตัว
    const headerKey = req.headers['x-api-key'];
    const authHeader = req.headers['authorization'] || '';
    const bearerKey = authHeader.startsWith('ApiKey ')
        ? authHeader.slice(7)
        : null;

    const clientKey = headerKey || bearerKey;   // คีย์ที่ client ส่งมา

    const serverKey = process.env.API_KEY;      // คีย์จริงฝั่ง server (ตั้งใน .env)

    // กันกรณีลืมตั้ง API_KEY ใน .env (ไม่งั้นใครส่งคีย์ว่างมาก็ผ่าน)
    if (!serverKey) {
        return Response.error(res, 'ระบบยังไม่ได้ตั้งค่า API_KEY (รัน node cli key:generate)', 500);
    }

    // ไม่แนบคีย์มาเลย
    if (!clientKey) {
        return Response.error(res, 'ต้องแนบ API Key (header: x-api-key)', 401);
    }

    // คีย์ไม่ตรง
    if (clientKey !== serverKey) {
        return Response.error(res, 'API Key ไม่ถูกต้อง', 403);
    }

    next();   // ผ่าน → ไป controller
};
