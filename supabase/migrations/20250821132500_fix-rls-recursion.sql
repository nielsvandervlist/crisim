-- Fix infinite recursion in profiles RLS policies
-- Use a simpler approach that doesn't cause recursion

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles from all organizations" ON profiles;
DROP POLICY IF EXISTS "Trainers can view profiles from their own organization" ON profiles;
DROP FUNCTION IF EXISTS user_belongs_to_org(UUID);
DROP FUNCTION IF EXISTS get_current_user_org_info();

-- Create simple, non-recursive policies
-- Policy 1: Users can view their own profile
-- (This should already exist from previous migrations)

-- Policy 2: Allow cross-organization profile viewing for admins
-- We'll use a subquery that checks the user's own profile for admin role
CREATE POLICY "Admin users can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN profiles admin_profile ON admin_profile.user_id = au.id
            WHERE au.id = auth.uid() 
            AND admin_profile.role = 'admin'
        )
    );

-- Policy 3: Allow same-organization profile viewing for trainers
CREATE POLICY "Trainer users can view org profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN profiles trainer_profile ON trainer_profile.user_id = au.id
            WHERE au.id = auth.uid() 
            AND trainer_profile.role = 'trainer'
            AND trainer_profile.organization_id = profiles.organization_id
        )
    );
