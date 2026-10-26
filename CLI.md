# api-node CLI (คล้าย `php artisan` ของ Laravel)

เครื่องมือ command line สำหรับ generate โครงสร้างโค้ดของโปรเจกต์นี้ให้อัตโนมัติ
โปรเจกต์นี้ใช้ **ORM (Sequelize) ล้วน** — โค้ดที่ generate ออกมาจะใช้สไตล์เดียวกับโค้ดเดิม
(Response helper, ValidateMiddleware, โมเดล Sequelize ใน `orm/`)

---

## 🚀 เริ่มโปรเจกต์ใหม่ (ใช้ตัวนี้เป็น boilerplate)

โปรเจกต์นี้ทำหน้าที่เป็น "แม่แบบ" — **โปรเจกต์ใหม่ไม่ใช่โฟลเดอร์ว่าง** แต่คือสำเนาของแม่แบบนี้
(เพราะโค้ดที่ generate ต้องพึ่ง `helpers/`, `middlewares/`, `orm/` ที่อยู่ในนี้)

**วิธีที่ง่ายที่สุด** — ใช้คำสั่ง `new` ก๊อปโครงสร้างทั้งหมดให้ (ข้าม node_modules / .env / ไฟล์อัปโหลด):

```bash
node cli new my-new-project     # สร้างโฟลเดอร์ my-new-project ที่โครงเหมือนโปรเจกต์นี้
cd my-new-project
npm install
node cli env:init               # สร้าง .env จาก .env.example
node cli key:generate           # สุ่ม JWT_SECRET + API_KEY ใส่ .env
# แก้ .env ให้ตรงเครื่อง (DB_USER / DB_PASSWORD / DB_DATABASE) แล้ว:
node cli db:migrate
node cli serve --dev
```

เปิด `http://localhost:3000/` เห็น `{"success":true,"message":"API is running"}` = พร้อมใช้งาน ✅

จากนั้นเพิ่มฟีเจอร์ใหม่ด้วยคำสั่งเดียว เช่น:
```bash
node cli make:crud Product --fields "name:string,price:decimal,stock:int"
node cli db:migrate --file products.sql      # สร้างตารางของ Product ที่เพิ่ง generate
```

> `make:crud` สร้างไฟล์ชื่อ `database/<ชื่อตาราง>.sql` (ยังไม่มีเลขนำหน้า)
> ถ้าตารางมี **foreign key** อ้างอิงตารางอื่น ให้เปลี่ยนชื่อไฟล์ใส่เลขนำหน้าเพื่อคุมลำดับการรัน เช่น `05_orders.sql`
> (ดูหัวข้อ [คำสั่งฐานข้อมูล](#คำสั่งฐานข้อมูล))

---

## วิธีใช้

```bash
node cli <command> [name] [options]
# หรือผ่าน npm:
npm run cli -- make:crud Category
```

ดูคำสั่งทั้งหมด: `node cli list`

## คำสั่งสร้างโค้ด

| คำสั่ง | ทำอะไร |
|--------|--------|
| `make:crud <Name>` | สร้างครบชุดแบบ **ORM**: model (`orm/`) + controller + route + ไฟล์ `.sql` และ **ลงทะเบียน route ใน `app.js` + โมเดลใน `orm/index.js` ให้อัตโนมัติ** |
| `make:auth` | สร้างระบบ **register / login / me** สำเร็จรูป (Hash, Jwt, AuthMiddleware, โมเดล `orm/User.js`, AuthService, AuthController, route + ตาราง `users`) |

## คำสั่งเริ่มโปรเจกต์

| คำสั่ง | ทำอะไร |
|--------|--------|
| `new <name>` | สร้างโปรเจกต์ใหม่ที่โครงสร้างเหมือนโปรเจกต์นี้ทั้งหมด (ข้าม `node_modules` / `.env` / ไฟล์อัปโหลด, สร้าง `.gitignore` ให้ด้วย) |

## คำสั่งฐานข้อมูล

| คำสั่ง | ทำอะไร |
|--------|--------|
| `db:migrate` | รันไฟล์ `.sql` ทั้งหมดใน `database/` เข้า DB (สร้าง database ให้ถ้ายังไม่มี) — ใส่ `--file <ชื่อ.sql>` เพื่อรันไฟล์เดียว |
| `db:fresh` | ลบ database แล้วสร้าง + รันใหม่ทั้งหมด ⚠️ **ข้อมูลหายหมด** |

> **ลำดับการรัน:** `db:migrate` อ่านไฟล์เรียงตามชื่อ (alphabetical) → ตั้งชื่อขึ้นต้นด้วยเลขเพื่อคุมลำดับ
> โดยเฉพาะตารางที่มี **foreign key** ต้องให้ตารางแม่รันก่อน มิฉะนั้น `db:fresh` จะล้มเหลว
> โปรเจกต์นี้ใช้ลำดับ:
> ```
> 01_users.sql → 02_products.sql → 03_product_images.sql
> 04_customers.sql → 05_orders.sql            (orders อ้างอิง customers)
> 06_students.sql → 07_courses.sql → 08_student_course.sql   (ตารางกลางอ้างอิง 2 ตารางก่อนหน้า)
> 09_user_profiles.sql                         (อ้างอิง users)
> ```

## คำสั่งตั้งค่าโปรเจกต์

| คำสั่ง | ทำอะไร |
|--------|--------|
| `env:init` | คัดลอก `.env.example` → `.env` (ใส่ `--force` เพื่อเขียนทับ) |
| `key:generate` | สุ่ม `JWT_SECRET` + `API_KEY` ใหม่ใส่ `.env` ให้ |
| `serve` | รัน server (`node app.js`) — ใส่ `--dev` เพื่อใช้ nodemon |

## Options

| option | ความหมาย |
|--------|----------|
| `--fields "name:string,price:decimal"` | กำหนดคอลัมน์ของตาราง |

**ชนิด field ที่รองรับ:** `string`, `text`, `int`, `decimal`, `float`, `tinyint`, `bool`, `date`, `datetime`

## ตัวอย่าง

```bash
# สร้าง CRUD แบบ ORM (เหมือน ProductController)
node cli make:crud Category --fields "name:string,active:tinyint"
node cli make:crud Post --fields "title:string,body:text,views:int"

# สร้างระบบ auth
node cli make:auth

# รัน server
node cli serve --dev
```

หลัง `make:crud` จะได้ endpoint พร้อมใช้ทันที เช่น `GET/POST/PUT/DELETE /categories`
> อย่าลืมสร้างตารางจริงใน DB ด้วย `node cli db:migrate --file <table>.sql`

## ไฟล์ของ CLI

```
cli.js              # ตัวรับคำสั่ง (dispatcher)
cli/utils.js        # ฟังก์ชันช่วยเหลือ: จัดการชื่อ, เขียนไฟล์, parse fields
cli/generators.js   # ตัวสร้างเนื้อหาไฟล์ ORM (แก้ template ที่นี่ถ้าอยากปรับสไตล์)
cli/db.js           # ตัวรัน migration (db:migrate / db:fresh)
cli/stubs/auth/     # แม่แบบไฟล์ของ make:auth
```

อยากปรับหน้าตาโค้ดที่ generate ออกมา → แก้ที่ `cli/generators.js`
