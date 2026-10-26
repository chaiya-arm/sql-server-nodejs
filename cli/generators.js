// cli/generators.js
// ตัวสร้างเนื้อหาไฟล์ (โค้ด) จากชื่อ + fields ที่ผู้ใช้ระบุ — สไตล์ ORM (orm/ + Sequelize)

const {
    pascalCase, camelCase, snakeCase, pluralize, sqlType,
} = require('./utils');

// สร้าง "ชื่อ" ทุกแบบจากอินพุตเดียว เช่น "product image"
// → { Model:'ProductImage', model:'productImage', table:'product_images', route:'product-images' }
function names(input) {
    const Model = pascalCase(input);                // ProductImage (คลาสโมเดล)
    const singularSnake = snakeCase(input);         // product_image
    const table = pluralize(singularSnake);         // product_images (ชื่อตาราง)
    const route = table.replace(/_/g, '-');         // product-images (path ของ route)
    return {
        Model,
        model: camelCase(input),                    // productImage (ตัวแปร)
        Controller: Model + 'Controller',
        table,
        route,
    };
}

// ===== 1) MODEL แบบ ORM (orm/Xxx.js) =====
function ormModel(n, fields) {
    const columnDefs = fields.map(f => {
        const t = ormType(f.type);
        return `    ${f.name}: DataTypes.${t},`;
    }).join('\n');

    return `// orm/${n.Model}.js
// โมเดล ${n.Model} แบบ Sequelize (นิยามหน้าตาตาราง ${n.table} ให้ ORM รู้จัก)
// (สร้างอัตโนมัติด้วย \`node cli make:crud ${n.Model}\`)

const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const ${n.Model} = sequelize.define('${n.Model}', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
${columnDefs}

}, {
    tableName: '${n.table}',   // บังคับชื่อตาราง (กัน Sequelize เดาเอง)
});

module.exports = ${n.Model};
`;
}

// แปลงชนิด field → DataTypes ของ Sequelize
function ormType(type) {
    const map = {
        string: 'STRING',
        text: 'TEXT',
        int: 'INTEGER', integer: 'INTEGER',
        decimal: 'DECIMAL(10, 2)',
        float: 'FLOAT',
        tinyint: 'TINYINT',
        bool: 'BOOLEAN', boolean: 'BOOLEAN',
        date: 'DATEONLY',
        datetime: 'DATE',
    };
    return map[type] || 'STRING';
}

// ===== 2) CONTROLLER แบบ ORM (controllers/XxxController.js) =====
function ormController(n, fields) {
    const createFields = fields.map(f => `                ${f.name}: req.body.${f.name},`).join('\n');
    const updateFields = fields.map(f => `                ${f.name}: req.body.${f.name} ?? item.${f.name},`).join('\n');

    return `// controllers/${n.Controller}.js
// CRUD ${n.Model} แบบ Sequelize (ORM) — ไม่ต้องเขียน SQL เอง
// (สร้างอัตโนมัติด้วย \`node cli make:crud ${n.Model}\`)

const { ${n.Model} } = require('../orm');
const Response = require('../helpers/Response');

class ${n.Controller} {

    // GET /${n.route}  → Laravel: ${n.Model}::all();
    static async index(req, res) {
        try {
            const data = await ${n.Model}.findAll({ order: [['id', 'DESC']] });
            return Response.success(res, data);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // GET /${n.route}/:id  → Laravel: ${n.Model}::find($id);
    static async show(req, res) {
        try {
            const item = await ${n.Model}.findByPk(req.params.id);
            if (!item) {
                return Response.error(res, 'ไม่พบข้อมูล', 404);
            }
            return Response.success(res, item);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // POST /${n.route}  → Laravel: ${n.Model}::create($request->all());
    static async store(req, res) {
        try {
            const item = await ${n.Model}.create({
${createFields}
            });
            return Response.success(res, item, 'เพิ่มข้อมูลสำเร็จ', 201);
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // PUT /${n.route}/:id  → Laravel: $item->update($request->all());
    static async update(req, res) {
        try {
            const item = await ${n.Model}.findByPk(req.params.id);
            if (!item) {
                return Response.error(res, 'ไม่พบข้อมูล', 404);
            }
            await item.update({
${updateFields}
            });
            return Response.success(res, item, 'แก้ไขข้อมูลสำเร็จ');
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

    // DELETE /${n.route}/:id  → Laravel: $item->delete();
    static async destroy(req, res) {
        try {
            const item = await ${n.Model}.findByPk(req.params.id);
            if (!item) {
                return Response.error(res, 'ไม่พบข้อมูล', 404);
            }
            await item.destroy();
            return Response.success(res, null, 'ลบข้อมูลสำเร็จ');
        } catch (err) {
            return Response.error(res, err.message);
        }
    }

}

module.exports = ${n.Controller};
`;
}

// ===== 3) ROUTE (routes/xxx.js) =====
function routeFile(n, fields) {
    const required = fields.slice(0, 2).map(f => `'${f.name}'`).join(', ') || `'${fields[0].name}'`;
    return `// routes/${n.route}.js
// เส้นทาง ${n.Model} (สร้างอัตโนมัติด้วย make:crud)

const express = require('express');
const router = express.Router();

const ${n.Controller} = require('../controllers/${n.Controller}');
const validate = require('../middlewares/ValidateMiddleware');

router.get('/', ${n.Controller}.index);

router.get('/:id', ${n.Controller}.show);

router.post('/', validate([${required}]), ${n.Controller}.store);

router.put('/:id', ${n.Controller}.update);

router.delete('/:id', ${n.Controller}.destroy);

module.exports = router;
`;
}

// ===== 4) ไฟล์ SQL สร้างตาราง (database/xxx.sql) =====
function sqlFile(n, fields) {
    const columnLines = fields.map(f => `    ${f.name} ${sqlType(f.type)},`).join('\n');
    return `-- database/${n.table}.sql
-- ตาราง ${n.table} (สร้างอัตโนมัติด้วย make:crud)

CREATE TABLE IF NOT EXISTS ${n.table} (
    id INT AUTO_INCREMENT PRIMARY KEY,
${columnLines}
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;
}

module.exports = {
    names,
    ormModel, ormController, ormType,
    routeFile, sqlFile,
};
