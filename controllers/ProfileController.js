// controllers/ProfileController.js
// CRUD โปรไฟล์ผู้ใช้ + ตัวอย่าง One-to-One (โปรไฟล์ ↔ user)

const { UserProfile, User } = require('../orm');
const Response = require('../helpers/Response');

class ProfileController {

    // GET /profiles → โปรไฟล์ทั้งหมด พร้อมข้อมูล user (ไม่เอา password)
    static async index(req, res) {
        try {
            const profiles = await UserProfile.findAll({
                include: { association: 'user', attributes: ['id', 'username', 'email'] },
                order: [['id', 'DESC']],
            });
            return Response.success(res, profiles);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // GET /profiles/:id → โปรไฟล์ 1 อัน พร้อม user เจ้าของ
    static async show(req, res) {
        try {
            const profile = await UserProfile.findByPk(req.params.id, {
                include: { association: 'user', attributes: ['id', 'username', 'email'] },
            });
            if (!profile) return Response.error(res, 'ไม่พบโปรไฟล์', 404);
            return Response.success(res, profile);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // POST /profiles → สร้างโปรไฟล์ให้ user (1 user ได้ 1 โปรไฟล์ — user_id เป็น UNIQUE)
    static async store(req, res) {
        try {
            const user = await User.findByPk(req.body.user_id);
            if (!user) return Response.error(res, 'ไม่พบผู้ใช้ (user_id ไม่ถูกต้อง)', 422);

            // กันสร้างซ้ำ (One-to-One: 1 user มีได้แค่ 1 โปรไฟล์)
            const exist = await UserProfile.findOne({ where: { user_id: req.body.user_id } });
            if (exist) return Response.error(res, 'ผู้ใช้นี้มีโปรไฟล์อยู่แล้ว', 409);

            const profile = await UserProfile.create({
                user_id: req.body.user_id,
                full_name: req.body.full_name,
                phone: req.body.phone,
                address: req.body.address,
            });
            return Response.success(res, profile, 'สร้างโปรไฟล์สำเร็จ', 201);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // PUT /profiles/:id → แก้ไข
    static async update(req, res) {
        try {
            const profile = await UserProfile.findByPk(req.params.id);
            if (!profile) return Response.error(res, 'ไม่พบโปรไฟล์', 404);
            await profile.update({
                full_name: req.body.full_name ?? profile.full_name,
                phone: req.body.phone ?? profile.phone,
                address: req.body.address ?? profile.address,
            });
            return Response.success(res, profile, 'แก้ไขโปรไฟล์สำเร็จ');
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // DELETE /profiles/:id → ลบ
    static async destroy(req, res) {
        try {
            const profile = await UserProfile.findByPk(req.params.id);
            if (!profile) return Response.error(res, 'ไม่พบโปรไฟล์', 404);
            await profile.destroy();
            return Response.success(res, null, 'ลบโปรไฟล์สำเร็จ');
        } catch (err) {
            return Response.error(res, err.message);
        }
    }
}

module.exports = ProfileController;
