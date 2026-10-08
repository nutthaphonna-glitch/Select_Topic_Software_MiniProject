-- ==========================================================
-- E-Book & Digital Product Store
-- Supabase PostgreSQL Database Schema & Seed Data
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Profiles Table (Users & Roles - Supabase Auth Sync)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow insert profile" 
ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update profile" 
ON public.profiles FOR UPDATE USING (true);

-- Auto trigger when user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Create Products Table (Digital Products & E-Books on Supabase)
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

CREATE POLICY "Allow insert products" 
ON public.products FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update products" 
ON public.products FOR UPDATE USING (true);

CREATE POLICY "Allow delete products" 
ON public.products FOR DELETE USING (true);

-- 4. Create Orders Table (Stripe Transactions & Statistics on Supabase)
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

CREATE POLICY "Orders are viewable by everyone" 
ON public.orders FOR SELECT USING (true);

CREATE POLICY "Anyone can create order on checkout" 
ON public.orders FOR INSERT WITH CHECK (true);

-- 5. Seed Core Products (6 Products)
INSERT INTO public.products (id, title, author, price, original_price, rating, file_type, category, description, gradient, tag)
VALUES
('eb-001', 'ชีวิตดีขึ้นได้ เริ่มจากตัวเรา', 'กิตติศักดิ์ พูลสวัสดิ์', 199, 299, 4.9, 'PDF (4.8 MB)', 'E-Book', 'หนังสือพัฒนาตนเองฉบับปรับปรุงใหม่ที่จะช่วยสร้างนิสัยเชิงบวก ปรับแนวคิดชีวิตสู่ความสำเร็จแบบยั่งยืน', 'from-blue-600 via-indigo-600 to-purple-700', 'BESTSELLER'),
('eb-002', 'การทำงานให้มีประสิทธิภาพสูงสุด', 'ดร. นภัสสร วงศ์ดีเลิศ', 249, 350, 4.8, 'PDF + Audio (12 MB)', 'E-Book', 'กลยุทธ์บริหารเวลาและเทคนิค Productivity ระดับสากล ปรับสมาธิและการจัดลำดับงานให้ได้ผลลัพธ์คูณสอง', 'from-slate-700 via-slate-800 to-zinc-950', 'POPULAR'),
('eb-003', 'คู่มือสุขภาพดีเริ่มต้นจากใจ', 'พญ. นิลุบล ศิริโชค', 179, 250, 4.9, 'PDF (6.2 MB)', 'E-Book', 'คู่มือดูแลจิตใจ ผ่อนคลายความเครียด และการสร้างสมดุลทางอารมณ์เพื่อสุขภาพกายและใจที่แข็งแรง', 'from-emerald-500 via-teal-600 to-cyan-700', 'HEALTH'),
('eb-004', 'Minimal Notion Life Planner 2026', 'NotionCraft Studio', 129, 199, 5.0, 'Notion Template (ZIP)', 'Template', 'เทมเพลต Notion สำหรับจัดระเบียบชีวิต การเงิน การงาน และบันทึกเป้าหมายรายปีอย่างเป็นระบบ', 'from-stone-600 via-stone-800 to-neutral-900', 'TEMPLATE'),
('eb-005', 'Ultimate Mobile UI Kit Figma', 'DesignX Pro', 399, 590, 4.9, 'Figma File (.fig)', 'Design', 'ชุด UI Kit ดีไซน์ระบบช้อปปิ้งและกระเป๋าเงินดิจิทัลกว่า 120+ Screens ปรับใช้งานได้ทันที', 'from-violet-600 via-fuchsia-600 to-pink-600', 'DESIGN'),
('eb-006', 'Generative AI Prompt Engineering Course', 'TechNova Academy', 450, 690, 4.9, 'Video + PDF (850 MB)', 'Course', 'คอร์สเรียนเทคนิคเขียน Prompt ให้ได้ผลลัพธ์ระดับเซียนสำหรับ ChatGPT, Claude, Midjourney', 'from-cyan-600 via-blue-600 to-indigo-800', 'HOT')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  category = EXCLUDED.category,
  description = EXCLUDED.description;

-- 6. Enable Realtime Publications for Live Sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
