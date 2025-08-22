-- Fix circular dependency in RLS policies
-- The issue is that scenarios policies reference training_sessions, which in turn reference scenarios

-- Drop the problematic policy that causes circular dependency
DROP POLICY IF EXISTS "Participants can view scenarios they're invited to" ON scenarios;

-- Create a simpler policy that doesn't reference training_sessions
-- Participants can view scenarios in their organization (this is sufficient for most use cases)
CREATE POLICY "Participants can view scenarios in their org" ON scenarios
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND organization_id IS NOT NULL
        )
    );

-- Also fix the documents and digital_experiences policies that have the same issue
DROP POLICY IF EXISTS "Participants can view documents for scenarios they're invited to" ON documents;
DROP POLICY IF EXISTS "Participants can view experiences for scenarios they're invited to" ON digital_experiences;

-- Create simpler policies for documents
CREATE POLICY "Participants can view documents in their org" ON documents
    FOR SELECT USING (
        scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND organization_id IS NOT NULL
            )
        )
    );

-- Create simpler policies for digital_experiences
CREATE POLICY "Participants can view experiences in their org" ON digital_experiences
    FOR SELECT USING (
        scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND organization_id IS NOT NULL
            )
        )
    );
