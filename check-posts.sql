-- Check if there are any posts in the database
-- Run this in Supabase SQL Editor

-- Count total posts
SELECT COUNT(*) as total_posts FROM public.posts;

-- Show all posts with user info
SELECT 
  p.id,
  p.user_id,
  p.description,
  p.sport,
  p.created_at,
  u.username,
  u.email
FROM public.posts p
LEFT JOIN public.users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Check if user with ID 12 exists
SELECT id, username, email, name FROM public.users WHERE id = 12;

-- Check posts for user 12
SELECT * FROM public.posts WHERE user_id = 12;
