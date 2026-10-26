// helpers/Response.js
// รูปแบบการตอบกลับมาตรฐานของทั้งระบบ ให้ response หน้าตาเหมือนกันทุก endpoint
// ทุก controller เรียกผ่านนี่ จะได้ไม่ต้องเขียน res.status().json() ซ้ำๆ

class Response {

    // ตอบกรณีสำเร็จ — ค่า default: data ว่าง, ข้อความ 'success', status 200
    static success(res, data = null, message = 'success', status = 200) {

        return res.status(status).json({
            success: true,       // ให้ frontend เช็ค flag นี้ตัวเดียวรู้ว่าสำเร็จ
            message: message,
            data: data
        });

    }

    // ตอบกรณีผิดพลาด — default: ข้อความ 'error', status 500 (server error)
    static error(res, message = 'error', status = 500, errors = null) {

        return res.status(status).json({
            success: false,
            message: message,
            errors: errors       // รายละเอียดเพิ่ม เช่น { missing: [...] } จาก validate
        });

    }

}

module.exports = Response;
