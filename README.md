# 📚 E-Book & Digital Product Store (Multi-Platform Ecosystem)

> **"ซื้อ-ขาย-จัดการ สินค้า Digital ได้ครบ จบในที่เดียว"**
> พัฒนาตามข้อกำหนดและดีไซน์ใน `requiment.jpg` และ `ui.jpg` รองรับ **Web App**, **Mobile App (React Native)**, และ **Desktop App (Electron)** พร้อมระบบ **User Authentication**, **Admin Role Guard**, **Stripe Payment Integration**, และ **Seller Publishing Portal**

---

## 🌟 ฟีเจอร์หลักของระบบ (Comprehensive Feature Breakdown)

### 1. 🔐 User Authentication & Roles (ระบบสมัครสมาชิกและเข้าสู่ระบบ)
- **Login / Register Modal**: สมัครสมาชิกด้วยชื่อ, อีเมล, รหัสผ่าน หรือเข้าสู่ระบบด้วย Google
- **Role-Based System**:
  - 🛡️ **Admin (ผู้ดูแลระบบ)**: มีสิทธิ์เข้าถึงหน้า Admin Dashboard จัดการสินค้า และดูยอดขายรวม
  - ✍️ **Seller / Creator (ผู้ขาย/นักเขียน)**: มีสิทธิ์เข้าถึงหน้า Seller Portal ส่งผลงานและวางขายหนังสือ
  - 👤 **Customer (ลูกค้าทั่วไป)**: เลือกซื้อสินค้า, ชำระเงินผ่าน Stripe และดาวน์โหลดไฟล์

### 2. 🛡️ Admin Dashboard with Role Guard (เฉพาะผู้ดูแลระบบเท่านั้น)
- **Access Control Guard**: หากผู้ใช้ที่ไม่มีสิทธิ์ Admin พยายามเข้าถึง Dashboard ระบบจะแสดงหน้าต่าง **"สงวนสิทธิ์เฉพาะ Admin เท่านั้น"**
- **สถิติยอดขายรวม (Stripe Revenue)**: คำนวณยอดขายจริงแบบ Real-time จากคำสั่งซื้อที่มีการชำระเงิน
- **กราฟแนวโน้มยอดขาย**: Sales Overview Line Chart อิงจากยอดคำสั่งซื้อจริงรายเดือน
- **Product Management (CRUD)**: ตารางรายการสินค้า เพิ่ม, ลบ, แก้ไข และดูรายละเอียด
- **Data Engine**: รองรับการนำเข้าไฟล์สินค้า (Drag & Drop CSV / JSON) และส่งออกรายงานยอดขาย (CSV / JSON)

### 3. 💳 Stripe Payment Integration (ระบบชำระเงินมาตรฐานโลก)
- **Stripe Secure Checkout**: แบบฟอร์มกรอกบัตรเครดิต/เดบิตสไตล์ **Stripe Elements**
- **Stripe Charge ID Generation**: ออกรหัสการตัดเงินอัตโนมัติ (เช่น `ch_3...`)
- **Stripe Connect & Payouts**: ระบบคำนวณยอดรอโอนสำหรับ Creator ตามยอดขายจริง (ส่วนแบ่ง 90%)
- **PromptPay QR Option**: ทางเลือกสแกนจ่าย QR Code จำลอง

### 4. ✍️ Seller & Creator Publishing Portal (หน้าสำหรับส่งขายหนังสือ)
- **หน้าลงขายสินค้า**: นักเขียน/ผู้สร้างสรรค์สามารถส่งผลงานวางขายบนหน้าร้านได้ทันที
- **แบบฟอร์มส่งผลงาน**:
  - ชื่อหนังสือ / สินค้า
  - หมวดหมู่ (E-Book, Template, Design, Course)
  - กำหนดราคาขายจริง (฿) และราคาเต็มก่อนลด
  - คำอธิบายรายละเอียดผลงาน
  - เลือกธีมสีหน้าปก (Teal, Purple, Rose, Amber)
  - อัปโหลดไฟล์สินค้าดิจิทัล (PDF / ZIP) ขนาดสูงสุด 50 MB
- **ผลลัพธ์**: สินค้าที่ส่งจะปรากฏบนหน้าร้านและแคตตาล็อกให้ลูกค้าสั่งซื้อได้ทันที!

### 5. 🛍️ Storefront & Book Catalog (ตาม `ui.jpg`)
- **Hero Banner**: *"อ่านได้ทุกที่ ทุกเวลา กับ E-Book ของเรา"* ในธีมสี Modern Blue พร้อมปุ่ม Call-to-action
- **Filter Categories**: ทั้งหมด, E-Book, Templates, UI Design
- **Product Cards & Modal**: แสดงภาพปก Gradient, ข้อมูลจำเพาะไฟล์ (`PDF 5 MB`, `อ่านได้ทุกอุปกรณ์`), คะแนนรีวิว, ตัวปรับจำนวนเล่ม, และปุ่มหยิบใส่ตะกร้า

### 6. 🚚 Order Verification & Instant Download Delivery
- ค้นหาด้วย **Order ID** หรือ **Email**
- แสดงสถานะ `PAID • ชำระเงินผ่าน Stripe เรียบร้อยแล้ว`
- แจ้งเตือน *"ส่งอีเมลสำเร็จ!"*
- **ปุ่มดาวน์โหลดไฟล์จริง (PDF/ZIP)** บันทึกลงเครื่องได้ทันที

### 7. 📱 Full Responsive Web Application
- รองรับการใช้งานสมบูรณ์แบบทั้งบน **Desktop**, **Tablet**, และ **Smartphones (Mobile Browser)** พร้อม Mobile Menu Drawer สะดวกสบาย
- โครงสร้างแยกสำหรับ Native Platforms อยู่ในโฟลเดอร์ `desktop/` (Electron) และ `mobile/` (React Native) ตามข้อกำหนดโปรเจกต์

### 8. ⚡ Supabase BaaS Integration (ตามสเปก `requiment.jpg`)
- **Database Engine (PostgreSQL)**: ตาราง `products` (สินค้า), `orders` (คำสั่งซื้อ), และ `profiles` (ข้อมูลผู้ใช้และสิทธิ์)
- **Supabase Auth**: ระบบสมาชิกผ่าน Email/Password และ OAuth
- **Supabase Realtime**: รับการแจ้งเตือนคำสั่งซื้อใหม่แบบสดๆ ทันทีที่ลูกค้าชำระเงินผ่าน Stripe
- **SQL Schema Script**: ไฟล์ [supabase_schema.sql](file:///e:/Select_Topic_Project/supabase_schema.sql) พร้อม Seed ข้อมูลและ RLS Policies สำหรับรันบน Supabase SQL Editor
- **Dual Engine Architecture**: สลับและซิงค์ข้อมูลระหว่าง Local Offline Cache และ Supabase Cloud ได้อย่างไร้รอยต่อ

---

## 📁 โครงสร้างโฟลเดอร์โปรเจกต์ (Project Structure)

```text
Select_Topic_Project/
├── supabase_schema.sql       # ⚡ Supabase PostgreSQL Database Schema & Seed Data
├── web/                      # 🌐 Web App (Storefront, Stripe Checkout, Seller Hub, Admin Dashboard)
│   ├── index.html            # Core Application & Responsive Web Interface
│   ├── supabase.js           # Supabase SDK Client & Database Service
│   └── downloads/            # ไฟล์ Digital Assets (.pdf, .zip) สำหรับดาวน์โหลดจริง
│
├── mobile/                   # 📱 React Native Mobile App
│   ├── App.js                # React Native Codebase พร้อม Auth, Seller Screen & Stripe
│   ├── app.json              # Expo Configuration
│   └── package.json          # React Native Dependencies
│
├── desktop/                  # 💻 Electron Desktop Application
│   ├── main.js               # Electron Main Process
│   ├── preload.js            # Desktop Bridge API
│   ├── index.html            # Desktop View พร้อม Left Sidebar & Admin Guard
│   └── package.json          # Electron Configuration
│
├── shared/                   # 📦 Shared Database & Assets
│   ├── data/products.json    # ข้อมูลสินค้าเริ่มต้น
│   ├── data/orders.json      # ข้อมูลคำสั่งซื้อและประวัติ Stripe
│   └── downloads/            # ไฟล์ตัวอย่างหนังสือ PDF และ ZIP
│
├── run_app.bat               # 🚀 สคริปต์คลิกเดียวเปิดแอปบน Windows
├── start_server.py           # Localhost Web Server (Port 3000)
└── README.md                 # คู่มือระบบ
```

---

## 🏃‍♂️ วิธีการเปิดใช้งาน (How to Run)

### วิธีที่ 1: ดับเบิลคลิกไฟล์ `run_app.bat` (ง่ายที่สุด)
ดับเบิลคลิกไฟล์ [run_app.bat](file:///e:/Select_Topic_Project/run_app.bat) เพื่อเปิดระบบและเบราว์เซอร์ไปยัง `http://localhost:3000` อัตโนมัติ

### วิธีที่ 2: รันผ่าน Terminal / PowerShell
```bash
python start_server.py
```
เปิดเบราว์เซอร์ไปที่: **`http://localhost:3000`**
