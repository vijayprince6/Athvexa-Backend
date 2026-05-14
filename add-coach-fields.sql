-- Add coach-specific fields to users table
-- Run this in Supabase SQL Editor

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'USER',
ADD COLUMN IF NOT EXISTS sport VARCHAR(100),
ADD COLUMN IF NOT EXISTS academy_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS experience VARCHAR(50);

-- Create index for faster coach queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_sport ON public.users(sport);
CREATE INDEX IF NOT EXISTS idx_users_role_sport ON public.users(role, sport);

-- Update existing users to have role = 'USER'
UPDATE public.users SET role = 'USER' WHERE role IS NULL;
