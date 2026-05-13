-- Speed up authentication and user queries
-- Run this in Supabase SQL Editor
-- Save as: "Performance Indexes for Auth"

-- Index on email for login lookups (makes login faster)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Index on username for uniqueness checks (makes registration faster)
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Composite index for faster auth queries
CREATE INDEX IF NOT EXISTS idx_users_email_password ON public.users(email, password);
