# คู่มือ Deploy (นำ API ขึ้นเซิร์ฟเวอร์จริง)

นำ Node.js API ขึ้นรันจริงบน **Windows + XAMPP** ให้รันตลอดเวลา (PM2) และเข้าถึงผ่านโดเมนได้ (Apache Reverse Proxy)

---

## ภาพรวม: มันทำงานยังไง

```
ผู้ใช้อินเทอร์เน็ต
      │  https://example.com/api
      ▼
Apache (port 80 / 443)          ← หน้าบ้าน รับ request จากภายนอก
      │  reverse proxy (ส่งต่อ)
      ▼
Node.js  127.0.0.1:3000         ← ตัว API จริง (คนนอกเข้าตรงไม่ได้)
      │  รันค้างไว้ด้วย
      ▼
PM2                             ← ทำให้ Node ไม่ดับ + รันเองตอนเปิดเครื่อง
```

- **Node** = ตัว API รันอยู่ภายในเครื่องที่ port 3000
- **PM2** = ตัวจัดการให้ Node รันตลอด แม้ปิด terminal หรือรีบูต
- **Apache** = ประตูหน้า รับคนจากอินเทอร์เน็ตแล้วส่งเข้าไปให้ Node

---

## ขั้นที่ 1–2: เตรียมโปรเจกต์

```bash
# เช็คว่าติดตั้ง Node.js แล้ว
node -v
npm -v

# สร้าง package.json (ถ้ายังไม่มี)
npm init -y

# ติดตั้งไลบรารีที่ใช้
npm install express mysql2 dotenv
```

โครงสร้างขั้นต่ำที่ต้องมี:
```
api-node/
├── app.js
├── package.json
├── routes/
└── node_modules/
```

---

## ขั้นที่ 3: ติดตั้ง PM2 ให้ API รันตลอดเวลา

```bash
npm install pm2 -g                  # ติดตั้ง PM2 แบบทั้งเครื่อง (-g)

pm2 start app.js --name myapi       # เริ่มรัน ตั้งชื่อว่า myapi
```

คำสั่งที่ใช้บ่อย:

| คำสั่ง | ทำอะไร |
|--------|--------|
| `pm2 list` | ดูสถานะทุกแอป |
| `pm2 stop myapi` | หยุด |
| `pm2 restart myapi` | รีสตาร์ท |
| `pm2 logs myapi` | ดู log แบบ real-time |

---

## ขั้นที่ 4: ให้ PM2 รันเองตอนเปิดเครื่อง (Windows)

```bash
npm install -g pm2-windows-startup
pm2-startup install

pm2 save        # จำรายการ process ที่รันอยู่ตอนนี้ไว้
```

> เมื่อรีบูตเครื่อง PM2 จะเปิดแอปที่ `pm2 save` ไว้ให้อัตโนมัติ

---

## ขั้นที่ 5: เปิด Apache Module

แก้ไฟล์ `xampp/apache/conf/httpd.conf` — เอาเครื่องหมาย `#` หน้า 3 บรรทัดนี้ออก (uncomment):

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule headers_module modules/mod_headers.so
```

---

## ขั้นที่ 6: ตั้งค่า VirtualHost (Reverse Proxy)

แก้ไฟล์ `xampp/apache/conf/extra/httpd-vhosts.conf` (หรือ `httpd-ssl.conf` ถ้าใช้ HTTPS) แล้วเพิ่ม:

```apache
<VirtualHost *:80>
    ServerName api.myserver.com

    ProxyPreserveHost On

    ProxyPass / http://127.0.0.1:3000
    ProxyPassReverse / http://127.0.0.1:3000
</VirtualHost>
```

ถ้าอยากให้เข้าผ่าน path เช่น `https://example.com/api` แทนทั้งโดเมน:

```apache
ProxyPass /api http://127.0.0.1:3000
ProxyPassReverse /api http://127.0.0.1:3000
```

---

## ขั้นที่ 7: Restart Apache

ใน XAMPP Control Panel:
1. กด **Stop** ที่ Apache
2. กด **Start** ที่ Apache

---

## ขั้นที่ 8: เปิด Firewall

- เปิดแค่ **port 80 และ 443** (ของ Apache) ก็พอ
- **ไม่ต้องเปิด port 3000** เพราะ Node ใช้แค่ภายในเครื่อง (`127.0.0.1:3000`)

เช็คว่ามีโปรเซสอะไร listen อยู่ที่ port นั้น:

```bash
netstat -ano | findstr :80
netstat -ano | findstr :443
```

---

## กรณีมีหลายโปรเจกต์ Node.js

ให้แต่ละโปรเจกต์ใช้ **คนละ port** แล้ว Apache แยกทางด้วย path:

| โปรเจกต์ | Port | เข้าผ่าน URL |
|----------|------|-------------|
| Auth API | 3000 | `example.com/auth` |
| Products API | 3001 | `example.com/products` |
| AI API | 3002 | `example.com/ai` |
| Notification API | 3003 | `example.com/notify` |

**กำหนด port ในแต่ละโปรเจกต์** (`app.js`):
```js
app.listen(3000);   // auth-api
app.listen(3001);   // products-api
app.listen(3002);   // ai-api
```

**รันด้วย PM2:**
```bash
pm2 start auth/app.js   --name auth-api
pm2 start products/app.js --name products-api
pm2 start ai/app.js     --name ai-api
pm2 start notify/app.js --name notify-api
```

**ตั้ง Apache Proxy แยกแต่ละ path:**
```apache
ProxyPass /auth http://127.0.0.1:3000/
ProxyPassReverse /auth http://127.0.0.1:3000/

ProxyPass /products http://127.0.0.1:3001/
ProxyPassReverse /products http://127.0.0.1:3001/

ProxyPass /ai http://127.0.0.1:3002/
ProxyPassReverse /ai http://127.0.0.1:3002/
```

ผลลัพธ์:
```
https://example.com/auth/login  →  127.0.0.1:3000/login
https://example.com/products/create →  127.0.0.1:3001/create
https://example.com/ai/ask      →  127.0.0.1:3002/ask
```

---

## สรุปสั้นๆ (Checklist)

- [ ] ติดตั้ง Node + ไลบรารี (`express`, `mysql2`, `dotenv`)
- [ ] `pm2 start app.js --name myapi` ให้ API รันตลอด
- [ ] `pm2-startup install` + `pm2 save` ให้รันเองตอนเปิดเครื่อง
- [ ] เปิด proxy module ใน `httpd.conf`
- [ ] ตั้ง VirtualHost ชี้เข้า `127.0.0.1:3000`
- [ ] Restart Apache
- [ ] เปิด firewall เฉพาะ port 80 / 443

---

## หมายเหตุ

- ตอน deploy อย่าลืมตั้งค่าไฟล์ `.env` บนเครื่องเซิร์ฟเวอร์ (ค่า DB, `API_KEY`, `JWT_SECRET`) — และ **อย่า commit `.env` ขึ้น git**
- ดูรายการ API ทั้งหมดได้ที่ [README.md](./README.md)
