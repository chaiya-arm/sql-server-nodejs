// orm/index.js
// ประกาศ "ความสัมพันธ์" ระหว่างโมเดล ที่เดียวจบ
// การ require ไฟล์นี้ = เป็นตัวรัน (activate) ความสัมพันธ์ทั้งหมดด้านล่างด้วย

// ===== การเชื่อมต่อ + โมเดลทั้งหมด =====
const sequelize = require('./sequelize');

// ฝั่งร้านค้า
const Product = require('./Product');
const Invoice = require('./invoices');
const Seller = require('./sellers');
const Customer = require('./Customer');

// ฝั่งผู้ใช้
const User = require('./User');
const UserProfile = require('./UserProfile');


// ===== ความสัมพันธ์ฝั่งร้านค้า (One-to-Many → invoices) =====

// 1 ลูกค้า (Customer) → หลายออเดอร์ (Invoice)
Customer.hasMany(Invoice, { foreignKey: 'c_id', as: 'invoices' });
Invoice.belongsTo(Customer, { foreignKey: 'c_id', as: 'customer' });

// 1 ผู้ขาย (Seller) → หลายออเดอร์ (Invoice)
Seller.hasMany(Invoice, { foreignKey: 's_id', as: 'invoices' });
Invoice.belongsTo(Seller, { foreignKey: 's_id', as: 'seller' });

// 1 สินค้า (Product) → หลายออเดอร์ (Invoice)
Product.hasMany(Invoice, { foreignKey: 'p_id', as: 'invoices' });
Invoice.belongsTo(Product, { foreignKey: 'p_id', as: 'product' });


// ===== ความสัมพันธ์ฝั่งผู้ใช้ (One-to-One: user ↔ profile) =====
User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'profile' });
UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


// ส่งออกทั้งก้อน → controller เขียน const { Customer, Invoice } = require('../orm') ได้เลย
module.exports = {
    sequelize,
    // ร้านค้า
    Product,
    Customer,
    Invoice,
    Seller,
    // ผู้ใช้
    User,
    UserProfile,
};
