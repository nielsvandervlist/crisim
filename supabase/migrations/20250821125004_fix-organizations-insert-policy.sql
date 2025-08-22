-- Fix organizations RLS to allow authenticated users to create organizations during signup
-- This allows users to create organizations when signing up as admin

CREATE POLICY "Authenticated users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
