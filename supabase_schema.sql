-- ==========================================================
-- E-Book & Digital Product Store
-- Supabase PostgreSQL Database Schema & Seed Data
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Profiles Table (Users & Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Create Products Table (Digital Products & E-Books)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    original_price NUMERIC,
    rating NUMERIC DEFAULT 5.0,
    file_type TEXT NOT NULL DEFAULT 'PDF',
    category TEXT NOT NULL,
    description TEXT,
    gradient TEXT NOT NULL DEFAULT 'from-blue-600 to-indigo-700',
    tag TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert products" 
ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products" 
ON public.products FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products" 
ON public.products FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Create Orders Table (Stripe Transactions & Purchases)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'PAID',
    payment_method TEXT NOT NULL DEFAULT 'stripe',
    stripe_charge_id TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders are viewable by everyone with Order ID or Email" 
ON public.orders FOR SELECT USING (true);

CREATE POLICY "Anyone can create order on checkout" 
ON public.orders FOR INSERT WITH CHECK (true);

-- 5. Seed Core Products (From ui.jpg & products.json)
INSERT INTO public.products (id, title, author, price, original_price, rating, file_type, category, description, gradient, tag)
VALUES
('eb-001', 'ชีวิตดีขึ้นได้ เริ่มจากตัวเรา', 'กิตติศักดิ์ พูลสวัสดิ์', 199, 299, 4.9, 'PDF (4.8 MB)', 'E-Book', 'หนังสือพัฒนาตนเองฉบับปรับปรุงใหม่ที่จะช่วยสร้างนิสัยเชิงบวก ปรับแนวคิดชีวิตสู่ความสำเร็จแบบยั่งยืน', 'from-blue-600 via-indigo-600 to-purple-700', 'BESTSELLER'),
('eb-002', 'การทำงานให้มีประสิทธิภาพสูงสุด', 'ดร. นภัสสร วงศ์ดีเลิศ', 249, 350, 4.8, 'PDF + Audio (12 MB)', 'E-Book', 'กลยุทธ์บริหารเวลาและเทคนิค Productivity ระดับสากล ปรับสมาธิและการจัดลำดับงานให้ได้ผลลัพธ์คูณสอง', 'from-slate-700 via-slate-800 to-zinc-950', 'POPULAR'),
('eb-003', 'คู่มือสุขภาพดีเริ่มต้นจากใจ', 'พญ. นิลุบล ศิริโชค', 179, 250, 4.9, 'PDF (6.2 MB)', 'E-Book', 'คู่มือดูแลจิตใจ ผ่อนคลายความเครียด และการสร้างสมดุลทางอารมณ์เพื่อสุขภาพกายและใจที่แข็งแรง', 'from-emerald-500 via-teal-600 to-cyan-700', 'HEALTH'),
('eb-004', 'Minimal Notion Life Planner 2026', 'NotionCraft Studio', 129, 199, 5.0, 'Notion Template (ZIP)', 'Template', 'เทมเพลต Notion สำหรับจัดระเบียบชีวิต การเงิน การงาน และบันทึกเป้าหมายรายปีอย่างเป็นระบบ', 'from-stone-600 via-stone-800 to-neutral-900', 'TEMPLATE'),
('eb-005', 'Ultimate Mobile UI Kit Figma', 'DesignX Pro', 399, 590, 4.9, 'Figma File (.fig)', 'Design', 'ชุด UI Kit ดีไซน์ระบบช้อปปิ้งและกระเป๋าเงินดิจิทัลกว่า 120+ Screens ปรับใช้งานได้ทันที', 'from-violet-600 via-fuchsia-600 to-pink-600', 'DESIGN'),
('eb-006', 'Generative AI Prompt Engineering Course', 'TechNova Academy', 450, 690, 4.9, 'Video + PDF (850 MB)', 'Course', 'คอร์สเรียนเทคนิคเขียน Prompt ให้ได้ผลลัพธ์ระดับเซียนสำหรับ ChatGPT, Claude, Midjourney', 'from-cyan-600 via-blue-600 to-indigo-800', 'HOT')
ON CONFLICT (id) DO NOTHING;

-- 6. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
