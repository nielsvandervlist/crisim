-- Add RLS policy for inviting members (profiles with null user_id)
CREATE POLICY "Admins can invite members to their organization" ON profiles
    FOR INSERT WITH CHECK (
        user_id IS NULL 
        AND organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
