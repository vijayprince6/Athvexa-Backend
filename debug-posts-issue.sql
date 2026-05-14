-- Debug: Check if posts exist for user 12

-- 1. Check if user 12 exists
SELECT id, username, email, name FROM public.users WHERE id = 12;

-- 2. Check all posts for user 12
SELECT 
  id, 
  user_id, 
  description, 
  sport, 
  image_url,
  created_at 
FROM public.posts 
WHERE user_id = 12
ORDER BY created_at DESC;

-- 3. Count total posts for user 12
SELECT COUNT(*) as total_posts FROM public.posts WHERE user_id = 12;

-- 4. Check if there are ANY posts in the database
SELECT COUNT(*) as all_posts FROM public.posts;

-- 5. Show all users with their post counts
SELECT 
  u.id,
  u.username,
  u.email,
  COUNT(p.id) as post_count
FROM public.users u
LEFT JOIN public.posts p ON u.id = p.user_id
GROUP BY u.id, u.username, u.email
ORDER BY post_count DESC;
