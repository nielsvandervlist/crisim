-- Fix Profiles RLS Policies for Signup
-- The current policies prevent profile creation during signup
-- We need to allow users to create their own profile

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Organization members can view other profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in their org" ON profiles;

-- Create new policies that allow profile creation
CREATE POLICY "Users can create their own profile" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Organization members can view other profiles in their org" ON profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND organization_id IS NOT NULL
        )
    );

CREATE POLICY "Admins can view all profiles in their org" ON profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
