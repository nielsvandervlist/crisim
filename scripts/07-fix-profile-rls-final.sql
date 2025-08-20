-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Organization members can view profiles" ON profiles;

-- Create more permissive RLS policies that work during signup
-- Allow users to insert their own profile (critical for signup)
CREATE POLICY "Enable insert for users creating own profile" ON profiles
    FOR INSERT 
    WITH CHECK (auth.uid()::text = id::text);

-- Allow users to view their own profile
CREATE POLICY "Enable select for own profile" ON profiles
    FOR SELECT 
    USING (auth.uid()::text = id::text);

-- Allow users to update their own profile
CREATE POLICY "Enable update for own profile" ON profiles
    FOR UPDATE 
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- Allow organization members to view other profiles in same org
CREATE POLICY "Enable select for organization members" ON profiles
    FOR SELECT 
    USING (
        organization_id IS NOT NULL 
        AND organization_id IN (
            SELECT organization_id 
            FROM profiles 
            WHERE id::text = auth.uid()::text
        )
    );

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
