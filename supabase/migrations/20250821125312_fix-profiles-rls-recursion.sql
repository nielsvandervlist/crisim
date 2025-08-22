-- Fix infinite recursion in profiles RLS policies
-- Remove policies that reference the profiles table within profiles policies

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Organization members can view other profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in their org" ON profiles;

-- For now, we'll rely on the basic policies:
-- - "Users can view their own profile" 
-- - "Users can update their own profile"
-- - "Users can insert their own profile"
-- 
-- Additional organization-based access can be added later if needed
-- without causing recursion issues
