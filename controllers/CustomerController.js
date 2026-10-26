// controllers/CustomerController.js
// CRUD ลูกค้า + ตัวอย่าง One-to-Many (1 ลูกค้า → หลายออเดอร์)

// ดึงโมเดล Customer, Invoice จาก orm/index.js (การ require นี้ activate ความสัมพันธ์ด้วย → ใช้ include ได้)
const { Customer, Invoice } = require('../orm');
// ตัวช่วยจัดรูปแบบ response มาตรฐาน (success / error)
const Response = require('../helpers/Response');

class CustomerController {

    // GET /customers → ลูกค้าทั้งหมด พร้อมออเดอร์ของแต่ละคน
    static async index(req, res) {                      // async เพราะต้อง await คุยกับ DB
        try {                                           // กัน error ไม่ให้แอปพัง → เด้งไป catch
            const customers = await Customer.findAll({  // findAll = SELECT หลายแถว, await = รอผล
                include: { association: 'invoices' },    // ดึงออเดอร์ของลูกค้าแต่ละคนมาด้วย (JOIN ตาม alias 'invoices')
                order: [['c_id', 'DESC']],               // เรียงตาม c_id มาก→น้อย (DESC)
            });
            return Response.success(res, customers);    // ตอบ { success:true, data:customers } status 200
        } catch (err) {
            return Response.error(res, err.message);    // error → { success:false, message } status 500
        }
    }

    // GET /customers/:id → ลูกค้า 1 คน พร้อมออเดอร์
    static async show(req, res) {
        try {
            const customer = await Customer.findByPk(req.params.id, {  // findByPk = หา 1 แถวจากคีย์หลัก (c_id) | req.params.id = ค่า :id ใน URL
                include: { association: 'invoices' },                   // เอาออเดอร์ของลูกค้าคนนี้มาด้วย
            });
            if (!customer) return Response.error(res, 'ไม่พบลูกค้า', 404); // findByPk คืน null = ไม่เจอ → ตอบ 404
            return Response.success(res, customer);                      // เจอ → ส่งข้อมูลกลับ
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // POST /customers → เพิ่มลูกค้า (c_id ไม่ใช่ identity ต้องส่งมาเอง)
    static async store(req, res) {
        try {
            const customer = await Customer.create({    // create = INSERT แถวใหม่ แล้วคืนแถวที่เพิ่งสร้าง
                c_id:   req.body.c_id,                   // req.body = ข้อมูล JSON ที่ client ส่งมา
                c_name: req.body.c_name,
                c_age:  req.body.c_age,
            });
            return Response.success(res, customer, 'เพิ่มลูกค้าสำเร็จ', 201); // 201 = Created (สร้างสำเร็จ)
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // PUT /customers/:id → แก้ไข
    static async update(req, res) {
        try {
            const customer = await Customer.findByPk(req.params.id);       // หาแถวที่จะแก้ก่อน
            if (!customer) return Response.error(res, 'ไม่พบลูกค้า', 404);  // ไม่เจอ → 404
            await customer.update({                      // update = UPDATE เฉพาะแถวนี้
                c_name: req.body.c_name ?? customer.c_name, // ?? = ส่งค่าใหม่มาก็ใช้ใหม่ / ไม่ส่ง (null|undefined) ก็คงค่าเดิม
                c_age:  req.body.c_age ?? customer.c_age,    // → แก้แค่บาง field ได้
            });
            return Response.success(res, customer, 'แก้ไขลูกค้าสำเร็จ');  // ส่งแถวที่แก้แล้วกลับ
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // DELETE /customers/:id → ลบ
    static async destroy(req, res) {
        try {
            const customer = await Customer.findByPk(req.params.id);       // หาแถวที่จะลบก่อน
            if (!customer) return Response.error(res, 'ไม่พบลูกค้า', 404);  // ไม่เจอ → 404
            await customer.destroy();                     // destroy = DELETE แถวนี้ออกจากตาราง
            return Response.success(res, null, 'ลบลูกค้าสำเร็จ'); // ลบแล้วไม่มีข้อมูลส่งกลับ → data = null
        } catch (err) {
            return Response.error(res, err.message);
        }
    }
}

module.exports = CustomerController;   // ส่งคลาสออกไปให้ routes/customers.js เรียกใช้
