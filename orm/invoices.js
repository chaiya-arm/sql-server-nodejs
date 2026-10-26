// orm/invoices.js
// โมเดลออเดอร์/ใบเสร็จ (invoices) — ฝั่ง "หลาย" ที่ belongsTo ทั้ง Customer / Seller / Product

const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Invoice = sequelize.define('Invoice', {
    inv_id:    { type: DataTypes.INTEGER, primaryKey: true },
    s_id:      DataTypes.INTEGER,   // FK → sellers.s_id
    c_id:      DataTypes.INTEGER,   // FK → customers.c_id
    p_id:      DataTypes.INTEGER,   // FK → products.p_id
    sum_total: DataTypes.DECIMAL(10, 2),
    quantity:  DataTypes.INTEGER,
}, {
    tableName: 'invoices',
    timestamps: false,
});

module.exports = Invoice;
