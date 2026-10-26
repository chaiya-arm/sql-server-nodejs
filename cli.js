#!/usr/bin/env node
// cli.js
// เครื่องมือ command line ของโปรเจกต์ (คล้าย `php artisan` ของ Laravel)
// โปรเจกต์นี้ใช้ ORM (Sequelize) ล้วน — generate โค้ดสไตล์เดียวกับโค้ดเดิม
// วิธีใช้:  node cli <command> [args] [options]
// ดูคำสั่งทั้งหมด:  node cli list

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const U = require('./cli/utils');
const G = require('./cli/generators');

// ---------- อ่าน argv ----------
const argv = process.argv.slice(2);
const command = argv[0];
const positional = argv.slice(1).filter(a => !a.startsWith('--'));

// อ่าน option แบบ --key value และ --flag
function getOption(name) {
    const i = argv.indexOf('--' + name);
    if (i === -1) return null;
    const next = argv[i + 1];
    return (next && !next.startsWith('--')) ? next : true;   // true = เป็น flag เปล่า
}

// ---------- แทรกข้อความเข้าไฟล์เดิม (ลงทะเบียน route / model) ----------
function insertBefore(filePath, marker, textToInsert, alreadyCheck) {
    const full = path.join(U.ROOT, filePath);
    let src = fs.readFileSync(full, 'utf8');
    if (alreadyCheck && src.includes(alreadyCheck)) {
        console.log(U.yellow('  ข้าม (ลงทะเบียนแล้ว)  ') + filePath);
        return;
    }
    const idx = src.indexOf(marker);
    if (idx === -1) {
        console.log(U.red('  หาไม่เจอจุดแทรกใน  ') + filePath + U.red('  (เพิ่มเองด้วยนะ)'));
        return;
    }
    src = src.slice(0, idx) + textToInsert + src.slice(idx);
    fs.writeFileSync(full, src, 'utf8');
    console.log(U.green('  แก้ไข            ') + filePath);
}

// ลงทะเบียน route เข้า app.js (แทรกก่อน health check)
function registerRoute(n) {
    const line = `app.use('/${n.route}', require('./routes/${n.route}'));\n\n`;
    insertBefore(
        'app.js',
        '// health check',
        line,
        `require('./routes/${n.route}')`
    );
}

// ลงทะเบียนโมเดล ORM เข้า orm/index.js (เพิ่ม require + ใส่ใน module.exports)
function registerOrmModel(n) {
    const full = path.join(U.ROOT, 'orm', 'index.js');
    let src = fs.readFileSync(full, 'utf8');

    if (src.includes(`require('./${n.Model}')`)) {
        console.log(U.yellow('  ข้าม (ลงทะเบียนแล้ว)  ') + 'orm/index.js');
        return;
    }

    // 1) เพิ่มบรรทัด require หลัง sequelize
    src = src.replace(
        "const sequelize = require('./sequelize');",
        `const sequelize = require('./sequelize');\nconst ${n.Model} = require('./${n.Model}');`
    );

    // 2) เพิ่มเข้า module.exports (หลัง "sequelize,")
    src = src.replace(
        /module\.exports = \{\s*\n\s*sequelize,/,
        `module.exports = {\n    sequelize,\n    ${n.Model},`
    );

    fs.writeFileSync(full, src, 'utf8');
    console.log(U.green('  แก้ไข            ') + 'orm/index.js  ' + U.yellow('(อย่าลืมผูกความสัมพันธ์เองถ้าต้องการ)'));
}

// ==================================================================
// คำสั่งต่าง ๆ
// ==================================================================

// make:crud <Name> — สร้างครบชุด (model + controller + route + sql) แบบ ORM/Sequelize
function makeCrud(input) {
    if (!input) return fail('ต้องระบุชื่อ เช่น:  node cli make:crud Product --fields "name:string,price:decimal"');

    const fields = U.parseFields(getOption('fields'));
    const n = G.names(input);

    console.log(U.bold(`\n สร้าง CRUD: ${n.Model}  (ORM / Sequelize)`));
    console.log(` fields: ${fields.map(f => `${f.name}:${f.type}`).join(', ')}\n`);

    U.writeFile(`orm/${n.Model}.js`, G.ormModel(n, fields));
    U.writeFile(`controllers/${n.Controller}.js`, G.ormController(n, fields));
    registerOrmModel(n);

    U.writeFile(`routes/${n.route}.js`, G.routeFile(n, fields));
    U.writeFile(`database/${n.table}.sql`, G.sqlFile(n, fields));
    registerRoute(n);

    console.log(U.cyan(`\n เสร็จแล้ว! ทดสอบได้ที่:  ${U.bold(`http://localhost:${process.env.PORT || 3000}/${n.route}`)}`));
    console.log(U.yellow(` อย่าลืมสร้างตารางใน DB:  node cli db:migrate --file ${n.table}.sql\n`));
}

// ===== db:migrate / db:fresh — รันไฟล์ .sql เข้า DB =====
function dbMigrate() {
    const db = require('./cli/db');
    const only = getOption('file');   // ระบุไฟล์เดียว เช่น --file products.sql
    db.migrate(typeof only === 'string' ? only : null).catch(e => fail(e.message));
}
function dbFresh() {
    const db = require('./cli/db');
    db.fresh().catch(e => fail(e.message));
}

// ===== env:init — คัดลอก .env.example -> .env =====
function envInit() {
    const src = path.join(U.ROOT, '.env.example');
    const dest = path.join(U.ROOT, '.env');
    if (!fs.existsSync(src)) return fail('ไม่พบ .env.example');
    if (fs.existsSync(dest) && !getOption('force')) {
        return fail('.env มีอยู่แล้ว (ใส่ --force เพื่อเขียนทับ)');
    }
    fs.copyFileSync(src, dest);
    console.log(U.green(' สร้าง .env จาก .env.example แล้ว') + U.yellow('  → รันต่อ:  node cli key:generate'));
}

// ===== key:generate — สุ่ม JWT_SECRET + API_KEY ใส่ .env =====
function keyGenerate() {
    const crypto = require('crypto');
    const dest = path.join(U.ROOT, '.env');
    if (!fs.existsSync(dest)) return fail('ไม่พบ .env (รัน node cli env:init ก่อน)');

    let env = fs.readFileSync(dest, 'utf8');
    const jwt = crypto.randomBytes(32).toString('hex');
    const apiKey = crypto.randomBytes(32).toString('hex');

    env = replaceOrAppend(env, 'JWT_SECRET', jwt);
    env = replaceOrAppend(env, 'API_KEY', apiKey);
    fs.writeFileSync(dest, env, 'utf8');

    console.log(U.green(' สุ่มกุญแจใหม่ใส่ .env แล้ว:'));
    console.log('  JWT_SECRET = ' + U.cyan(jwt));
    console.log('  API_KEY    = ' + U.cyan(apiKey));
}

// แทนค่า KEY=... ถ้ามีอยู่ ไม่งั้นเพิ่มต่อท้าย
function replaceOrAppend(text, key, value) {
    const re = new RegExp('^' + key + '=.*$', 'm');
    if (re.test(text)) return text.replace(re, `${key}=${value}`);
    return text.trimEnd() + `\n${key}=${value}\n`;
}

// ===== make:auth — scaffold ระบบ register / login / me สำเร็จรูป (แบบ ORM) =====
function makeAuth() {
    const stubDir = path.join(U.ROOT, 'cli', 'stubs', 'auth');
    const map = [
        ['Hash.js.stub',            'helpers/Hash.js'],
        ['Jwt.js.stub',             'helpers/Jwt.js'],
        ['AuthMiddleware.js.stub',  'middlewares/AuthMiddleware.js'],
        ['User.js.stub',            'orm/User.js'],            // โมเดล User แบบ Sequelize
        ['AuthService.js.stub',     'services/AuthService.js'],
        ['AuthController.js.stub',  'controllers/AuthController.js'],
        ['auth.routes.js.stub',     'routes/auth.js'],
        ['users.sql.stub',          'database/users.sql'],
    ];

    console.log(U.bold('\n สร้างระบบ auth (register / login / me) แบบ ORM\n'));

    for (const [stub, dest] of map) {
        const content = fs.readFileSync(path.join(stubDir, stub), 'utf8');
        U.writeFile(dest, content);
    }

    // ลงทะเบียนโมเดล User เข้า orm/index.js + route /auth ใน app.js (ข้ามถ้ามีอยู่แล้ว)
    registerOrmModel({ Model: 'User' });
    registerRoute({ route: 'auth' });

    console.log(U.cyan('\n เสร็จแล้ว! endpoint ที่ได้:'));
    console.log('   POST /auth/register   (username, password, [fullname,email,phone])');
    console.log('   POST /auth/login      (username, password) → คืน token');
    console.log('   GET  /auth/me         (แนบ header Authorization: Bearer <token>)');
    console.log(U.yellow('\n อย่าลืม:  node cli db:migrate   เพื่อสร้างตาราง users\n'));
}

// ===== new <name> — สร้างโปรเจกต์ใหม่ที่โครงสร้างเหมือนโปรเจกต์นี้ =====
const SKIP_NAMES = new Set(['node_modules', '.git', '.env', 'text']);
const SKIP_EXT = new Set(['.log']);

function skipCopy(fullPath, entry) {
    const name = entry.name;
    if (SKIP_NAMES.has(name)) return true;
    if (!entry.isDirectory() && SKIP_EXT.has(path.extname(name).toLowerCase())) return true;
    // ไม่ก๊อปไฟล์อัปโหลดเดิม (เก็บแค่โครงโฟลเดอร์ uploads เปล่า)
    const rel = path.relative(U.ROOT, fullPath).split(path.sep)[0];
    if (rel === 'uploads' && !entry.isDirectory()) return true;
    return false;
}

function copyProject(src, dst, destRoot) {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const from = path.join(src, entry.name);
        if (path.resolve(from) === destRoot) continue;   // กันก๊อปตัวเองลงไป (infinite loop)
        if (skipCopy(from, entry)) continue;
        const to = path.join(dst, entry.name);
        if (entry.isDirectory()) copyProject(from, to, destRoot);
        else fs.copyFileSync(from, to);
    }
}

function newProject(name) {
    if (!name) return fail('ต้องระบุชื่อ เช่น:  node cli new my-app');

    const dest = path.resolve(process.cwd(), name);
    if (fs.existsSync(dest) && fs.readdirSync(dest).length > 0) {
        return fail('โฟลเดอร์ปลายทางมีไฟล์อยู่แล้ว: ' + dest);
    }

    console.log(U.bold(`\n สร้างโปรเจกต์ใหม่: ${name}`));
    console.log(' คัดลอกโครงสร้าง (ข้าม node_modules / .env / ไฟล์อัปโหลด)...');

    copyProject(U.ROOT, dest, dest);

    // โฟลเดอร์ uploads เปล่า + .gitkeep
    fs.mkdirSync(path.join(dest, 'uploads'), { recursive: true });
    fs.writeFileSync(path.join(dest, 'uploads', '.gitkeep'), '');

    // .gitignore กันไฟล์ที่ไม่ควรขึ้น git
    fs.writeFileSync(path.join(dest, '.gitignore'),
        'node_modules\n.env\nuploads/*\n!uploads/.gitkeep\n*.log\n');

    // ตั้งชื่อใน package.json ให้ตรงชื่อโปรเจกต์ใหม่
    try {
        const pkgPath = path.join(dest, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        pkg.name = path.basename(dest).toLowerCase().replace(/[^a-z0-9-]/g, '-');
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    } catch (e) { /* ไม่มี package.json ก็ข้าม */ }

    console.log(U.green('\n สร้างเสร็จแล้ว!') + '  → ' + dest);
    console.log(U.cyan('\n ขั้นตอนต่อไป:'));
    console.log(`   cd ${name}`);
    console.log('   npm install');
    console.log('   node cli env:init        # สร้าง .env');
    console.log('   node cli key:generate    # สุ่มกุญแจลับ');
    console.log(U.yellow('   # แก้ .env: DB_USER / DB_PASSWORD / DB_DATABASE ให้ตรงเครื่อง'));
    console.log('   node cli db:migrate      # สร้าง DB + ตาราง');
    console.log('   node cli serve --dev     # รัน server\n');
}

function serve() {
    const dev = !!getOption('dev');
    const cmd = dev ? 'npx nodemon app.js' : 'node app.js';
    console.log(U.cyan(` กำลังรัน: ${cmd}\n`));
    execSync(cmd, { stdio: 'inherit', cwd: U.ROOT });
}

function fail(msg) {
    console.log(U.red(' ผิดพลาด: ') + msg);
    process.exitCode = 1;
}

function help() {
    console.log(`
${U.bold('api-node CLI')}  — เครื่องมือสร้างโครงสร้างโค้ด ORM (คล้าย php artisan)

${U.bold('วิธีใช้:')}  node cli <command> [name] [options]

${U.bold('คำสั่งสร้างโค้ด:')}
  ${U.cyan('make:crud')} <Name>        สร้างครบชุด ORM: model + controller + route + sql + ลงทะเบียนใน app.js
  ${U.cyan('make:auth')}               สร้างระบบ register/login/me สำเร็จรูป (ORM User + ตาราง users)

${U.bold('คำสั่งเริ่มโปรเจกต์:')}
  ${U.cyan('new')} <name>              สร้างโปรเจกต์ใหม่ที่โครงสร้างเหมือนโปรเจกต์นี้ทั้งหมด

${U.bold('คำสั่งฐานข้อมูล:')}
  ${U.cyan('db:migrate')}              รันไฟล์ .sql ทั้งหมดใน database/ เข้า DB (สร้าง DB ให้ถ้ายังไม่มี)
                          ใส่ --file <ชื่อ.sql> เพื่อรันไฟล์เดียว
  ${U.cyan('db:fresh')}                ลบ DB แล้วสร้าง+รันใหม่ทั้งหมด ${U.red('(ข้อมูลหายหมด!)')}

${U.bold('คำสั่งตั้งค่าโปรเจกต์:')}
  ${U.cyan('env:init')}                คัดลอก .env.example -> .env   (ใส่ --force เพื่อเขียนทับ)
  ${U.cyan('key:generate')}            สุ่ม JWT_SECRET + API_KEY ใส่ .env ให้

${U.bold('คำสั่งรัน:')}
  ${U.cyan('serve')}                   รัน server (node app.js)   ใส่ --dev เพื่อใช้ nodemon

${U.bold('options:')}
  ${U.yellow('--fields')} "a:string,b:int"   กำหนดคอลัมน์  (ชนิด: string,text,int,decimal,float,tinyint,bool,date,datetime)

${U.bold('ตัวอย่าง:')}
  node cli make:crud Category --fields "name:string,active:tinyint"
  node cli make:crud Post --fields "title:string,body:text,views:int"
  node cli make:auth
  node cli serve --dev
`);
}

// ==================================================================
// ตัวจ่ายงาน (dispatcher)
// ==================================================================
switch (command) {
    case 'make:crud':        makeCrud(positional[0]); break;
    case 'make:auth':        makeAuth(); break;
    case 'new':              newProject(positional[0]); break;
    case 'db:migrate':       dbMigrate(); break;
    case 'db:fresh':         dbFresh(); break;
    case 'env:init':         envInit(); break;
    case 'key:generate':     keyGenerate(); break;
    case 'serve':            serve(); break;
    case 'list':
    case 'help':
    case '--help':
    case '-h':
    case undefined:          help(); break;
    default:
        fail(`ไม่รู้จักคำสั่ง "${command}"`);
        help();
}
