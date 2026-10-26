// cli/utils.js
// ฟังก์ชันช่วยเหลือของ CLI: จัดการชื่อ (case), เขียนไฟล์แบบกันเขียนทับ, สีข้อความ

const fs = require('fs');
const path = require('path');

// รากของโปรเจกต์ (โฟลเดอร์ที่มี app.js) = ขึ้นไป 1 ชั้นจาก cli/
const ROOT = path.join(__dirname, '..');

// ===== จัดการชื่อ (naming) =====

// "product_image" / "productImage" / "ProductImage" → "ProductImage"
function pascalCase(str) {
    return str
        .replace(/[-_\s]+/g, ' ')                 // แยกคำด้วย - _ ช่องว่าง
        .replace(/([a-z])([A-Z])/g, '$1 $2')      // แยก camelCase
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
}

// "ProductImage" → "productImage"
function camelCase(str) {
    const p = pascalCase(str);
    return p.charAt(0).toLowerCase() + p.slice(1);
}

// "ProductImage" → "product_image"
function snakeCase(str) {
    return pascalCase(str)
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .toLowerCase();
}

// ทำพหูพจน์อย่างง่ายแบบภาษาอังกฤษ: category → categories, box → boxes, product → products
function pluralize(word) {
    if (/[^aeiou]y$/i.test(word)) return word.replace(/y$/i, 'ies');
    if (/(s|x|z|ch|sh)$/i.test(word)) return word + 'es';
    return word + 's';
}

// ===== อ่านค่า fields จาก command line =====
// "name:string,price:decimal,stock:int" → [{ name:'name', type:'string' }, ...]
function parseFields(raw) {
    if (!raw) return [{ name: 'name', type: 'string' }];   // ค่าเริ่มต้นถ้าไม่ระบุ

    return raw.split(',').map(pair => {
        const [name, type] = pair.split(':');
        return { name: name.trim(), type: (type || 'string').trim().toLowerCase() };
    }).filter(f => f.name);
}

// แปลงชนิด field → ชนิดคอลัมน์ของ MySQL (ใช้ตอนสร้างไฟล์ .sql)
function sqlType(type) {
    const map = {
        string: 'VARCHAR(255)',
        text: 'TEXT',
        int: 'INT',
        integer: 'INT',
        decimal: 'DECIMAL(10,2)',
        float: 'FLOAT',
        tinyint: 'TINYINT',
        bool: 'TINYINT(1)',
        boolean: 'TINYINT(1)',
        date: 'DATE',
        datetime: 'DATETIME',
    };
    return map[type] || 'VARCHAR(255)';
}

// ===== เขียนไฟล์แบบปลอดภัย (กันเขียนทับของเดิม) =====
function writeFile(relativePath, content, { force = false } = {}) {
    const full = path.join(ROOT, relativePath);
    const dir = path.dirname(full);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(full) && !force) {
        console.log(yellow('  ข้าม (มีอยู่แล้ว)  ') + relativePath);
        return false;
    }

    fs.writeFileSync(full, content, 'utf8');
    console.log(green('  สร้าง            ') + relativePath);
    return true;
}

// ===== สีข้อความในเทอร์มินัล =====
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

module.exports = {
    ROOT,
    pascalCase,
    camelCase,
    snakeCase,
    pluralize,
    parseFields,
    sqlType,
    writeFile,
    green, yellow, cyan, red, bold,
};
