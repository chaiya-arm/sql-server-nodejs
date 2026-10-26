// routes/protected.js
// กลุ่ม "ต้องผ่าน API Key" — ทุก route ในไฟล์นี้ต้องแนบ header x-api-key ที่ถูกต้อง
// ไม่งั้นจะโดน ApiKeyMiddleware ตีกลับ (401 ไม่แนบ / 403 คีย์ผิด) ไม่ถึง handler

const express = require('express');
const router = express.Router();

const Response = require('../helpers/Response');
const apiKey = require('../middlewares/ApiKeyMiddleware');   // ด่านเช็ค API Key

// ใส่ apiKey ครั้งเดียวตรงนี้ = บังคับกับ "ทุก" route ด้านล่างในไฟล์นี้
// (ถ้าอยากบังคับเฉพาะบาง route ให้ย้ายไปใส่รายตัว เช่น router.get('/x', apiKey, handler))
router.use(apiKey);

// GET /api/secret — ข้อมูลลับตัวอย่าง (ต้องมีคีย์ถึงจะเห็น)
router.get('/secret', (req, res) => {
    return Response.success(res, { secret: 'เฉพาะ client ที่มี API Key เท่านั้นที่เห็นข้อความนี้' });
});

// GET /api/whoami — ยืนยันว่าผ่านด่าน API Key มาแล้ว
router.get('/whoami', (req, res) => {
    return Response.success(res, { authorized: true }, 'ผ่านการตรวจ API Key แล้ว');
});

module.exports = router;
