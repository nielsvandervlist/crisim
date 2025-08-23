-- Completely remove all recursive RLS policies and start fresh
-- This migration removes ALL policies that reference the profiles table within profiles policies

-- Drop ALL existing policies on profiles table - including the recursive ones still in the DB
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Role-based profile access" ON profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Trainer users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Organization members can view other profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
-- These are the actual problematic policies that are still in the database
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Trainers can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation for invited users" ON profiles;
DROP POLICY IF EXISTS "Admins can invite members to their organization" ON profiles;

-- Create only the most basic, non-recursive policies
-- Policy 1: Users can always view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (user_id = auth.uid());

-- Policy 2: Users can always update their own profile  
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Policy 3: Users can always insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- For now, we'll disable the complex organization-based policies
-- and focus on getting basic profile creation working
-- We can add organization-based access later using a different approach
