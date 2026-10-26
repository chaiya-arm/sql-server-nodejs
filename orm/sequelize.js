// orm/sequelize.js
// ตัวเชื่อมต่อ Sequelize (ORM) ใช้ค่าเดียวกับ .env เดิม
// เทียบ Laravel: อันนี้คือส่วน config/database.php + การ bootstrap Eloquent

// ดึง "คลาส Sequelize" (ตัว S ใหญ่ = คลาสหลักของไลบรารี) ออกมาใช้สร้างการเชื่อมต่อ
const { Sequelize } = require('sequelize');

// โหลดค่าจากไฟล์ .env เข้ามาไว้ใน process.env (เช่น รหัสผ่าน DB) จะได้ไม่ต้อง hard-code
require('dotenv').config();

// สร้าง instance การเชื่อมต่อ 1 อัน (ตัว s เล็ก) โดยส่ง ชื่อ DB / user / password + object ตั้งค่า
const sequelize = new Sequelize(
    process.env.DB_DATABASE,   // อาร์กิวเมนต์ 1: ชื่อฐานข้อมูล
    process.env.DB_USER,       // อาร์กิวเมนต์ 2: ชื่อผู้ใช้ DB
    process.env.DB_PASSWORD,   // อาร์กิวเมนต์ 3: รหัสผ่าน DB
    {
        host: process.env.DB_HOST,   // เครื่องที่ DB อยู่ เช่น localhost
        port: Number(process.env.DB_PORT) || 1433,   // พอร์ตของ SQL Server (มาตรฐาน 1433)
        dialect: 'mssql',       // บอกว่าเป็น SQL Server → Sequelize จะไปเรียก driver tedious ที่ลงไว้ให้อัตโนมัติ
        logging: false,         // false = ไม่พ่น SQL ออก console (ตั้ง true ถ้าอยากเห็น SQL ที่ Sequelize สร้าง)
        dialectOptions: {
            options: {
                encrypt: true,                 // Azure SQL ต้อง true; SQL Server ในเครื่องก็ตั้ง true ได้
                trustServerCertificate: true,  // true สำหรับเครื่อง dev ที่ใช้ self-signed cert
            }
        },
        define: {
            timestamps: true,       // ทุกตารางมีคอลัมน์ created_at / updated_at อัตโนมัติ (เหมือน $timestamps=true)
            underscored: true,      // ใช้ชื่อ created_at (snake_case) แทน createdAt ให้ตรงกับตารางเดิม
        }
    }
);

// ส่งออก "การเชื่อมต่อตัวเดียวนี้" ให้ทุกโมเดล require ไปใช้ → ผูกกับ DB เดียวกันทั้งหมด
module.exports = sequelize;
