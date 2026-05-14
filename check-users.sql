-- Check all users in the database
SELECT id, username, email, name, auth_id, created_at 
FROM public.users 
ORDER BY id DESC;

-- Count total users
SELECT COUNT(*) as total_users FROM public.users;

-- Find user by email (replace with your email)
SELECT id, username, email, name 
FROM public.users 
WHERE email LIKE '%vijay%' OR username LIKE '%vijay%';
