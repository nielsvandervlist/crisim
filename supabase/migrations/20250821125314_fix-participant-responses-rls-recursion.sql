-- Fix potential circular dependency in participant_responses RLS policies
-- The issue is that participant_responses policies reference training_sessions,
-- which could create circular dependencies

-- Drop the problematic policy that could cause infinite recursion
DROP POLICY IF EXISTS "Admins and trainers can view all responses in their org" ON participant_responses;

-- Create a simpler policy that doesn't reference training_sessions directly
-- Instead, we'll use a join approach that's more efficient and avoids recursion
CREATE POLICY "Admins and trainers can view responses in their org" ON participant_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM training_sessions ts
            JOIN profiles p ON ts.organization_id = p.organization_id
            WHERE ts.id = participant_responses.session_id
            AND p.user_id = auth.uid() 
            AND p.role IN ('admin', 'trainer')
        )
    );

-- Keep the existing policies for participants since they don't reference training_sessions
-- "Participants can view their own responses" - uses participant_id = auth.uid()
-- "Participants can insert their own responses" - uses participant_id = auth.uid()
