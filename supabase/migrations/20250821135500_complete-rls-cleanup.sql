-- Complete RLS cleanup - remove ALL recursive policies found in the database dump
-- This migration removes ALL policies that reference the profiles table within profiles policies

-- Drop ALL existing policies on profiles table - based on actual database dump
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Role-based profile access" ON profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Trainer users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Organization members can view other profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in their org" ON profiles;
-- These are the actual problematic policies that are still in the database
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Trainers can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation for invited users" ON profiles;
DROP POLICY IF EXISTS "Admins can invite members to their organization" ON profiles;

-- Create only the most basic, non-recursive policies
-- These policies ONLY check auth.uid() and don't reference profiles table

-- Policy 1: Users can always view their own profile
CREATE POLICY "Basic user view own profile" ON profiles
    FOR SELECT USING (user_id = auth.uid());

-- Policy 2: Users can always update their own profile  
CREATE POLICY "Basic user update own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Policy 3: Users can always insert their own profile
CREATE POLICY "Basic user insert own profile" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());
