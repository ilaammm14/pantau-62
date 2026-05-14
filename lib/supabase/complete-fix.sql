-- ============================================
-- PANTAU+62 - Complete Fix for All Issues
-- Run ALL of this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Simplify Roles
-- ============================================

UPDATE public.users 
SET role = 'admin' 
WHERE role IN ('super_admin', 'regional_admin', 'local_admin');

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('user', 'admin'));

-- ============================================
-- STEP 2: Fix Foreign Key
-- ============================================

ALTER TABLE public.reports 
DROP CONSTRAINT IF EXISTS reports_user_id_fkey;

ALTER TABLE public.reports
ADD CONSTRAINT reports_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- ============================================
-- STEP 3: Drop ALL Existing Policies
-- ============================================

-- Users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert user" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Public can view user profiles for reports" ON public.users;

-- Reports table
DROP POLICY IF EXISTS "Anyone can view reports" ON public.reports;
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;

-- Notifications table
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;

-- ============================================
-- STEP 4: Create NEW Policies (Simplified)
-- ============================================

-- USERS TABLE
-- Allow anyone to view user profiles (needed for report joins)
CREATE POLICY "Anyone can view user profiles" 
ON public.users 
FOR SELECT 
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Allow new user registration
CREATE POLICY "Anyone can insert user" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- REPORTS TABLE
-- Anyone can view reports (public dashboard)
CREATE POLICY "Anyone can view reports" 
ON public.reports 
FOR SELECT 
USING (true);

-- Authenticated users can insert their own reports
CREATE POLICY "Authenticated users can insert reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports
CREATE POLICY "Users can update own reports" 
ON public.reports 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can update any report
CREATE POLICY "Admins can update any report" 
ON public.reports 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can delete reports
CREATE POLICY "Admins can delete reports" 
ON public.reports 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- NOTIFICATIONS TABLE
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications" 
ON public.notifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- STEP 5: Verification
-- ============================================

-- Check roles
SELECT role, COUNT(*) as count FROM public.users GROUP BY role;

-- Check foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'reports' AND tc.constraint_type = 'FOREIGN KEY';

-- Check policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- DONE! Now set your email as admin:
-- ============================================

-- Replace with your email
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'ilham.22315027@umkendari.ac.id';

-- Verify
SELECT id, email, role FROM public.users WHERE email = 'ilham.22315027@umkendari.ac.id';
