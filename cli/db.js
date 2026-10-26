// cli/db.js
// ตัวรันไฟล์ .sql ในโฟลเดอร์ database/ เข้าฐานข้อมูลจริง (คล้าย php artisan migrate)
// ใช้ค่าเชื่อมต่อจาก .env เดียวกับ db.js

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const U = require('./utils');
const DB_DIR = path.join(U.ROOT, 'database');

// อ่านรายชื่อไฟล์ .sql (เรียงตามตัวอักษร) — ใส่เลขนำหน้าเพื่อคุมลำดับได้ เช่น 01_users.sql
function sqlFiles(only) {
    if (!fs.existsSync(DB_DIR)) return [];
    let files = fs.readdirSync(DB_DIR).filter(f => f.endsWith('.sql')).sort();
    if (only) files = files.filter(f => f === only || f === only + '.sql');
    return files;
}

// เชื่อมต่อ MySQL (ยังไม่เลือก database เพื่อให้สร้าง database ได้ก่อน)
async function connect(withDatabase) {
    return mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: withDatabase ? process.env.DB_DATABASE : undefined,
        multipleStatements: true,   // ให้รันหลายคำสั่งในไฟล์เดียวได้
    });
}

// migrate: สร้าง database (ถ้ายังไม่มี) แล้วรันไฟล์ .sql ทั้งหมด
async function migrate(only) {
    const dbName = process.env.DB_DATABASE;
    const files = sqlFiles(only);

    if (files.length === 0) {
        console.log(U.yellow(' ไม่พบไฟล์ .sql ใน database/'));
        return;
    }

    // 1) สร้าง database ถ้ายังไม่มี
    const root = await connect(false);
    await root.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await root.end();
    console.log(U.green(' พร้อมใช้งาน database: ') + dbName);

    // 2) รันแต่ละไฟล์
    const conn = await connect(true);
    for (const file of files) {
        const sql = fs.readFileSync(path.join(DB_DIR, file), 'utf8').trim();
        if (!sql) continue;
        try {
            await conn.query(sql);
            console.log(U.green('  รันแล้ว   ') + 'database/' + file);
        } catch (err) {
            console.log(U.red('  ล้มเหลว   ') + 'database/' + file + '  → ' + err.message);
        }
    }
    await conn.end();
    console.log(U.cyan('\n migrate เสร็จสิ้น'));
}

// fresh: ลบ database ทิ้งแล้วสร้าง+รันใหม่ทั้งหมด (ระวัง! ข้อมูลหายหมด)
async function fresh() {
    const dbName = process.env.DB_DATABASE;
    const root = await connect(false);
    await root.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await root.end();
    console.log(U.yellow(' ลบ database เดิมแล้ว: ') + dbName);
    await migrate();
}

module.exports = { migrate, fresh };
