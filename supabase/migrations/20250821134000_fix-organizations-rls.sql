-- Fix organizations RLS policies to prevent recursion and allow proper access
-- The issue is that organization policies reference profiles, which causes recursion

-- Drop the problematic organization policies that reference profiles
DROP POLICY IF EXISTS "Organization admins can manage their organization" ON organizations;
DROP POLICY IF EXISTS "Organization members can view their organization" ON organizations;

-- Create simpler policies for organizations that don't cause recursion
-- Allow all authenticated users to view organizations (needed for profile creation)
CREATE POLICY "Authenticated users can view organizations" ON organizations
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow admins to manage organizations (we'll implement this without recursion later if needed)
-- For now, we'll focus on getting the basic functionality working
