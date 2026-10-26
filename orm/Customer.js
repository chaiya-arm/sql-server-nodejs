// orm/Customer.js
// โมเดลลูกค้า (customers) — ฝั่ง "1" ของ One-to-Many (1 ลูกค้า → หลายออเดอร์)

const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Customer = sequelize.define('Customer', {
    c_id:   { type: DataTypes.INTEGER, primaryKey: true },   // PK (ไม่ใช่ identity → ต้องส่งค่ามาเอง)
    c_name: DataTypes.STRING,
    c_age:  DataTypes.INTEGER,
}, {
    tableName: 'customers',
    timestamps: false,       // ตารางนี้ไม่มี created_at/updated_at
});

module.exports = Customer;
