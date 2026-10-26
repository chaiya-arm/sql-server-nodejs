// orm/User.js
// โมเดล User แบบ Sequelize — เทียบกับ Model แบบ Eloquent (Laravel)
//   protected $table       -> tableName
//   protected $fillable    -> การประกาศ field ด้านล่าง
//   protected $casts       -> DataTypes ของแต่ละ field
//   getFullNameAttribute() -> getter (accessor) ด้านล่าง

// DataTypes = ชนิดข้อมูลของคอลัมน์
const { DataTypes } = require('sequelize');

// การเชื่อมต่อ DB ตัวเดียวกับโมเดลอื่น
const sequelize = require('./sequelize');

const User = sequelize.define('User', {

    id: {
        type: DataTypes.INTEGER,   // จำนวนเต็ม
        primaryKey: true,          // คีย์หลัก
        autoIncrement: true,       // รันเลขอัตโนมัติ
    },
    username: DataTypes.STRING,    // ชื่อผู้ใช้
    password: DataTypes.STRING,    // รหัสผ่าน (เก็บเป็น hash)
    fullname: DataTypes.STRING,    // ชื่อจริง
    email:    DataTypes.STRING,    // อีเมล
    phone:    DataTypes.STRING,    // เบอร์โทร
    status:   DataTypes.TINYINT,   // สถานะบัญชี 0/1

    // accessor (ฟิลด์เสมือน): เทียบ getFullNameAttribute() ใน Laravel
    // เรียกใช้ผ่าน user.display_name
    display_name: {
        type: DataTypes.VIRTUAL,   // VIRTUAL = ไม่มีอยู่จริงในตาราง คำนวณสดตอนอ่าน
        get() {
            // this = แถวข้อมูลนั้นๆ | (fullname || '') กัน null ไม่ให้พัง | .trim() ตัดช่องว่างหัวท้าย
            return `${this.fullname || ''} (${this.username})`.trim();
        }
    }

}, {
    tableName: 'users',     // ผูกกับตารางชื่อ users (เทียบ protected $table = 'users')
});

// ส่งออกโมเดลไปใช้งาน
module.exports = User;
