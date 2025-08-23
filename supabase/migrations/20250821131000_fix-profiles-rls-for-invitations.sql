-- Fix Profiles RLS Policies for Invitation Acceptance
-- Allow profile creation during invitation acceptance process

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a new insert policy that allows:
-- 1. Users to insert their own profile (normal signup)
-- 2. Profile creation during invitation acceptance (where user_id matches auth.uid())
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR 
        -- Allow profile creation for invitation acceptance
        (user_id = auth.uid() AND email_verified = true)
    );

-- Also add a policy to allow profile creation for invited users
-- This is needed because during invitation acceptance, the user might not be fully authenticated yet
CREATE POLICY "Allow profile creation for invited users" ON profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM member_invitations 
            WHERE email = profiles.email 
            AND status = 'pending'
            AND expires_at > NOW()
        )
    );
