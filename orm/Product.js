// orm/Product.js
// โมเดลสินค้า (products) — ฝั่ง "1" ของ One-to-Many (1 สินค้า → หลายออเดอร์)

const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Product = sequelize.define('Product', {
    p_id:    { type: DataTypes.INTEGER, primaryKey: true },
    p_name:  DataTypes.STRING,
    p_price: DataTypes.DECIMAL(10, 2),
    p_stock: DataTypes.INTEGER,
}, {
    tableName: 'products',
    timestamps: false,
});

module.exports = Product;
