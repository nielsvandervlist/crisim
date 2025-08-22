-- Fix organizations RLS to allow authenticated users to view organizations for profile creation
-- This allows users to see organizations when creating their first profile

CREATE POLICY "Authenticated users can view organizations for profile creation" ON organizations
    FOR SELECT USING (auth.uid() IS NOT NULL);
