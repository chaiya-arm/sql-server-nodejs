// controllers/InvoiceController.js
// CRUD ออเดอร์/ใบเสร็จ + ตัวอย่าง belongsTo (1 ออเดอร์ → ลูกค้า/ผู้ขาย/สินค้า อย่างละ 1)

const { Invoice, Customer, Seller, Product } = require('../orm');
const Response = require('../helpers/Response');

// include มาตรฐาน: ดึงลูกค้า/ผู้ขาย/สินค้าของออเดอร์มาด้วย
const withRelations = [
    { association: 'customer' },
    { association: 'seller' },
    { association: 'product' },
];

class InvoiceController {

    // GET /invoices → ออเดอร์ทั้งหมด พร้อมลูกค้า/ผู้ขาย/สินค้า
    static async index(req, res) {
        try {
            const invoices = await Invoice.findAll({
                include: withRelations,
                order: [['inv_id', 'DESC']],
            });
            return Response.success(res, invoices);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // GET /invoices/:id
    static async show(req, res) {
        try {
            const invoice = await Invoice.findByPk(req.params.id, { include: withRelations });
            if (!invoice) return Response.error(res, 'ไม่พบออเดอร์', 404);
            return Response.success(res, invoice);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // POST /invoices → สร้างออเดอร์ (ตรวจว่า c_id/s_id/p_id มีจริงก่อน)
    static async store(req, res) {
        try {
            const { inv_id, c_id, s_id, p_id, quantity } = req.body;

            // เช็ก foreign key ว่าอ้างถึงของจริง
            const [customer, seller, product] = await Promise.all([
                Customer.findByPk(c_id),
                Seller.findByPk(s_id),
                Product.findByPk(p_id),
            ]);
            if (!customer) return Response.error(res, 'ไม่พบลูกค้า (c_id ไม่ถูกต้อง)', 422);
            if (!seller) return Response.error(res, 'ไม่พบผู้ขาย (s_id ไม่ถูกต้อง)', 422);
            if (!product) return Response.error(res, 'ไม่พบสินค้า (p_id ไม่ถูกต้อง)', 422);

            // คิดยอดรวมจากราคาสินค้า × จำนวน (ถ้าไม่ได้ส่ง sum_total มา)
            const sum_total = req.body.sum_total ?? Number(product.p_price) * Number(quantity);

            const invoice = await Invoice.create({ inv_id, c_id, s_id, p_id, quantity, sum_total });
            return Response.success(res, invoice, 'สร้างออเดอร์สำเร็จ', 201);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // PUT /invoices/:id
    static async update(req, res) {
        try {
            const invoice = await Invoice.findByPk(req.params.id);
            if (!invoice) return Response.error(res, 'ไม่พบออเดอร์', 404);
            await invoice.update({
                quantity:  req.body.quantity ?? invoice.quantity,
                sum_total: req.body.sum_total ?? invoice.sum_total,
            });
            return Response.success(res, invoice, 'แก้ไขออเดอร์สำเร็จ');
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // DELETE /invoices/:id
    static async destroy(req, res) {
        try {
            const invoice = await Invoice.findByPk(req.params.id);
            if (!invoice) return Response.error(res, 'ไม่พบออเดอร์', 404);
            await invoice.destroy();
            return Response.success(res, null, 'ลบออเดอร์สำเร็จ');
        } catch (err) {
            return Response.error(res, err.message);
        }
    }
}

module.exports = InvoiceController;
