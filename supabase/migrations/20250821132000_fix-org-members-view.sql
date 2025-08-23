-- Fix organization members view RLS policy
-- Implement proper permission levels:
-- - Admins can see all users from all organizations
-- - Trainers can only see users from their own organization

-- First, let's create a function to check if a user belongs to an organization
CREATE OR REPLACE FUNCTION user_belongs_to_org(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND organization_id = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a policy that allows admins to view ALL profiles (from all organizations)
CREATE POLICY "Admins can view all profiles from all organizations" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create a policy that allows trainers to view profiles only from their own organization
CREATE POLICY "Trainers can view profiles from their own organization" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'trainer'
            AND organization_id = profiles.organization_id
        )
    );

-- Keep the existing policy for users to view their own profile
-- (This should already exist from previous migrations)
