-- Fix RLS policies for profiles table to allow signup
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policies that work with signup
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Allow organization admins to view profiles in their org
CREATE POLICY "Admins can view org profiles" ON profiles
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id::text = auth.uid()::text 
      AND p.role = 'admin' 
      AND p.organization_id = profiles.organization_id
    )
  );
