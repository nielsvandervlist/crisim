-- Fix organization access without recursion using SECURITY DEFINER functions
-- This approach bypasses RLS recursion by using elevated privilege functions

-- Create a function to check if user is admin (runs with elevated privileges)
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is trainer (runs with elevated privileges)
CREATE OR REPLACE FUNCTION is_user_trainer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'trainer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user's organization ID (runs with elevated privileges)
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id FROM profiles 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create policies that use these functions (no recursion possible)
-- Policy 1: Users can always view their own profile (keep existing)
-- Policy 2: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        user_id = auth.uid() OR is_user_admin()
    );

-- Policy 3: Trainers can view profiles in their organization
CREATE POLICY "Trainers can view org profiles" ON profiles
    FOR SELECT USING (
        user_id = auth.uid() OR 
        (is_user_trainer() AND organization_id = get_user_organization_id())
    );

-- Policy 4: Users can update their own profile (keep existing)
-- Policy 5: Users can insert their own profile (keep existing)
