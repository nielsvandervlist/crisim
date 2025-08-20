-- Fix the profiles table to allow null organization_id for users who haven't joined an organization yet
ALTER TABLE profiles ALTER COLUMN organization_id DROP NOT NULL;

-- Update RLS policies to handle users without organizations
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;

CREATE POLICY "Users can view profiles in their organization" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        (organization_id IS NOT NULL AND organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        ))
    );

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
