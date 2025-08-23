-- Clean up any remaining problematic functions and policies
-- Drop policies first, then functions to avoid dependency issues

-- Drop and recreate the problematic policies to make sure they're clean
DROP POLICY IF EXISTS "Role-based profile access" ON profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Trainer users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Organization members can view other profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in their org" ON profiles;

-- Drop any remaining functions that might have type mismatches
DROP FUNCTION IF EXISTS get_current_user_org_info();
DROP FUNCTION IF EXISTS user_belongs_to_org(UUID);

-- Create simple, working policies without any functions
-- Policy 1: Users can always view their own profile (should already exist)

-- Policy 2: Admins can view all profiles (simple version)
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles admin_check 
            WHERE admin_check.user_id = auth.uid() 
            AND admin_check.role = 'admin'
        )
    );

-- Policy 3: Trainers can view profiles in their organization
CREATE POLICY "Trainers can view org profiles" ON profiles
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles trainer_check 
            WHERE trainer_check.user_id = auth.uid() 
            AND trainer_check.role = 'trainer'
            AND trainer_check.organization_id = profiles.organization_id
        )
    );
