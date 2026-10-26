// orm/UserProfile.js
// โมเดล user_profiles — ฝั่ง "โปรไฟล์" ของ One-to-One (1 user มี 1 โปรไฟล์)

const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const UserProfile = sequelize.define('UserProfile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id:   DataTypes.INTEGER,   // foreign key → users.id (UNIQUE = 1 user ต่อ 1 โปรไฟล์)
    full_name: DataTypes.STRING,
    phone:     DataTypes.STRING,
    address:   DataTypes.TEXT,

}, {
    tableName: 'user_profiles',
    timestamps: false,
});

module.exports = UserProfile;
