// controllers/SellerController.js
// CRUD ผู้ขาย + ตัวอย่าง One-to-Many (1 ผู้ขาย → หลายออเดอร์)

const { Seller } = require('../orm');
const Response = require('../helpers/Response');

class SellerController {

    // GET /sellers → ผู้ขายทั้งหมด พร้อมออเดอร์
    static async index(req, res) {
        try {
            const sellers = await Seller.findAll({
                include: { association: 'invoices' },
                order: [['s_id', 'DESC']],
            });
            return Response.success(res, sellers);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // GET /sellers/:id
    static async show(req, res) {
        try {
            const seller = await Seller.findByPk(req.params.id, {
                include: { association: 'invoices' },
            });
            if (!seller) return Response.error(res, 'ไม่พบผู้ขาย', 404);
            return Response.success(res, seller);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // POST /sellers → เพิ่มผู้ขาย (s_id ต้องส่งมาเอง)
    static async store(req, res) {
        try {
            const seller = await Seller.create({
                s_id:   req.body.s_id,
                s_name: req.body.s_name,
                s_age:  req.body.s_age,
            });
            return Response.success(res, seller, 'เพิ่มผู้ขายสำเร็จ', 201);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // PUT /sellers/:id
    static async update(req, res) {
        try {
            const seller = await Seller.findByPk(req.params.id);
            if (!seller) return Response.error(res, 'ไม่พบผู้ขาย', 404);
            await seller.update({
                s_name: req.body.s_name ?? seller.s_name,
                s_age:  req.body.s_age ?? seller.s_age,
            });
            return Response.success(res, seller, 'แก้ไขผู้ขายสำเร็จ');
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // DELETE /sellers/:id
    static async destroy(req, res) {
        try {
            const seller = await Seller.findByPk(req.params.id);
            if (!seller) return Response.error(res, 'ไม่พบผู้ขาย', 404);
            await seller.destroy();
            return Response.success(res, null, 'ลบผู้ขายสำเร็จ');
        } catch (err) {
            return Response.error(res, err.message);
        }
    }
}

module.exports = SellerController;
