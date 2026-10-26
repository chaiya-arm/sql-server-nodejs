// orm/sellers.js
// โมเดลผู้ขาย (sellers) — ฝั่ง "1" ของ One-to-Many (1 ผู้ขาย → หลายออเดอร์)

const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Seller = sequelize.define('Seller', {
    s_id:   { type: DataTypes.INTEGER, primaryKey: true },
    s_name: DataTypes.STRING,
    s_age:  DataTypes.INTEGER,
}, {
    tableName: 'sellers',
    timestamps: false,
});

module.exports = Seller;
