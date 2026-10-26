// controllers/ProductController.js
// CRUD สินค้า + ตัวอย่าง One-to-Many (1 สินค้า → หลายออเดอร์)

const { Product } = require('../orm');
const Response = require('../helpers/Response');

class ProductController {

    // GET /products → สินค้าทั้งหมด พร้อมออเดอร์ที่อ้างถึงสินค้านั้น
    static async index(req, res) {
        try {
            const products = await Product.findAll({
                include: { association: 'invoices' },
                order: [['p_id', 'DESC']],
            });
            return Response.success(res, products);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // GET /products/:id
    static async show(req, res) {
        try {
            const product = await Product.findByPk(req.params.id, {
                include: { association: 'invoices' },
            });
            if (!product) return Response.error(res, 'ไม่พบสินค้า', 404);
            return Response.success(res, product);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // POST /products → เพิ่มสินค้า (p_id ต้องส่งมาเอง)
    static async store(req, res) {
        try {
            const product = await Product.create({
                p_id:    req.body.p_id,
                p_name:  req.body.p_name,
                p_price: req.body.p_price,
                p_stock: req.body.p_stock,
            });
            return Response.success(res, product, 'เพิ่มสินค้าสำเร็จ', 201);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // PUT /products/:id
    static async update(req, res) {
        try {
            const product = await Product.findByPk(req.params.id);
            if (!product) return Response.error(res, 'ไม่พบสินค้า', 404);
            await product.update({
                p_name:  req.body.p_name ?? product.p_name,
                p_price: req.body.p_price ?? product.p_price,
                p_stock: req.body.p_stock ?? product.p_stock,
            });
            return Response.success(res, product, 'แก้ไขสินค้าสำเร็จ');
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // DELETE /products/:id
    static async destroy(req, res) {
        try {
            const product = await Product.findByPk(req.params.id);
            if (!product) return Response.error(res, 'ไม่พบสินค้า', 404);
            await product.destroy();
            return Response.success(res, null, 'ลบสินค้าสำเร็จ');
        } catch (err) {
            return Response.error(res, err.message);
        }
    }
}

module.exports = ProductController;
