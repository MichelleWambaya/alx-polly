-- Debug script to check database state
-- Run this in your Supabase SQL editor to diagnose the issue

-- 1. Check if profiles table exists and has data
SELECT 
  'profiles' as table_name,
  COUNT(*) as row_count,
  COUNT(DISTINCT id) as unique_ids
FROM public.profiles;

-- 2. Check if polls table exists and has data
SELECT 
  'polls' as table_name,
  COUNT(*) as row_count,
  COUNT(DISTINCT user_id) as unique_user_ids
FROM public.polls;

-- 3. Check for orphaned polls (polls without profiles)
SELECT 
  p.id as poll_id,
  p.title,
  p.user_id,
  pr.name as profile_name
FROM public.polls p
LEFT JOIN public.profiles pr ON p.user_id = pr.id
WHERE pr.id IS NULL;

-- 4. Check for profiles without polls
SELECT 
  pr.id as profile_id,
  pr.name,
  COUNT(p.id) as poll_count
FROM public.profiles pr
LEFT JOIN public.polls p ON pr.id = p.user_id
GROUP BY pr.id, pr.name
ORDER BY poll_count DESC;

-- 5. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'polls')
ORDER BY tablename, policyname;

-- 6. Check foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('profiles', 'polls')
ORDER BY tc.table_name, kcu.column_name;
