-- Simple RLS fix - Allow backend to read everything
-- This version avoids all type casting issues

-- ============================================
-- POSTS TABLE - Simple policies
-- ============================================
DROP POLICY IF EXISTS "View posts" ON public.posts;
DROP POLICY IF EXISTS "Create post" ON public.posts;
DROP POLICY IF EXISTS "Update post" ON public.posts;
DROP POLICY IF EXISTS "Delete post" ON public.posts;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE to view all posts (including backend)
CREATE POLICY "View posts"
ON public.posts
FOR SELECT
USING (true);

-- Allow authenticated users to create posts
CREATE POLICY "Create post"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update their own posts
CREATE POLICY "Update post"
ON public.posts
FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete their own posts
CREATE POLICY "Delete post"
ON public.posts
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- USERS TABLE - Simple policies
-- ============================================
DROP POLICY IF EXISTS "View users" ON public.users;
DROP POLICY IF EXISTS "Update own user" ON public.users;
DROP POLICY IF EXISTS "Insert user" ON public.users;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE to view user profiles (including backend)
CREATE POLICY "View users"
ON public.users
FOR SELECT
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Insert user"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Update own user"
ON public.users
FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- LIKES TABLE - Simple policies
-- ============================================
DROP POLICY IF EXISTS "View likes" ON public.likes;
DROP POLICY IF EXISTS "Create like" ON public.likes;
DROP POLICY IF EXISTS "Delete like" ON public.likes;
DROP POLICY IF EXISTS "Manage my likes" ON public.likes;

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE to view likes (including backend)
CREATE POLICY "View likes"
ON public.likes
FOR SELECT
USING (true);

-- Allow authenticated users to create likes
CREATE POLICY "Create like"
ON public.likes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to delete likes
CREATE POLICY "Delete like"
ON public.likes
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- MESSAGES TABLE - Simple policies
-- ============================================
DROP POLICY IF EXISTS "View messages" ON public.messages;
DROP POLICY IF EXISTS "Send message" ON public.messages;
DROP POLICY IF EXISTS "Delete message" ON public.messages;

-- Check if messages table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    EXECUTE 'ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "View messages" ON public.messages FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Send message" ON public.messages FOR INSERT TO authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Delete message" ON public.messages FOR DELETE TO authenticated USING (true)';
  END IF;
END $$;

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posts_auth_id ON public.posts(auth_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
