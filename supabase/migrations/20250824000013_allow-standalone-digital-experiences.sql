-- Allow standalone digital experiences (templates)
-- This migration modifies the digital_experiences table to support experiences that aren't tied to specific scenarios

-- Make scenario_id optional to allow standalone experiences
ALTER TABLE digital_experiences ALTER COLUMN scenario_id DROP NOT NULL;

-- Add a new column to track if this is a standalone template
ALTER TABLE digital_experiences ADD COLUMN is_template BOOLEAN DEFAULT FALSE;

-- Update RLS policies to handle both scenario-based and standalone experiences

-- Drop existing policies
DROP POLICY IF EXISTS "Organization members can view experiences" ON digital_experiences;
DROP POLICY IF EXISTS "Admins and trainers can create experiences" ON digital_experiences;
DROP POLICY IF EXISTS "Admins and trainers can update experiences" ON digital_experiences;
DROP POLICY IF EXISTS "Admins and trainers can delete experiences" ON digital_experiences;

-- New policy: Organization members can view experiences (both scenario-based and standalone)
CREATE POLICY "Organization members can view experiences" ON digital_experiences
    FOR SELECT USING (
        -- For scenario-based experiences, check organization access
        (scenario_id IS NOT NULL AND scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND organization_id IS NOT NULL
            )
        ))
        OR
        -- For standalone experiences, check if user is in the same organization
        (scenario_id IS NULL AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND organization_id IS NOT NULL
        ))
    );

-- New policy: Organization admins and trainers can create experiences
CREATE POLICY "Admins and trainers can create experiences" ON digital_experiences
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'trainer')
            AND organization_id IS NOT NULL
        )
        AND
        (
            -- For scenario-based experiences, verify scenario belongs to organization
            (scenario_id IS NOT NULL AND scenario_id IN (
                SELECT id FROM scenarios 
                WHERE organization_id IN (
                    SELECT organization_id FROM profiles 
                    WHERE user_id = auth.uid()
                )
            ))
            OR
            -- For standalone experiences, just check user permissions
            (scenario_id IS NULL)
        )
    );

-- New policy: Organization admins and trainers can update experiences
CREATE POLICY "Admins and trainers can update experiences" ON digital_experiences
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'trainer')
            AND organization_id IS NOT NULL
        )
        AND
        (
            -- For scenario-based experiences, verify scenario belongs to organization
            (scenario_id IS NOT NULL AND scenario_id IN (
                SELECT id FROM scenarios 
                WHERE organization_id IN (
                    SELECT organization_id FROM profiles 
                    WHERE user_id = auth.uid()
                )
            ))
            OR
            -- For standalone experiences, just check user permissions
            (scenario_id IS NULL)
        )
    );

-- New policy: Organization admins and trainers can delete experiences
CREATE POLICY "Admins and trainers can delete experiences" ON digital_experiences
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'trainer')
            AND organization_id IS NOT NULL
        )
        AND
        (
            -- For scenario-based experiences, verify scenario belongs to organization
            (scenario_id IS NOT NULL AND scenario_id IN (
                SELECT id FROM scenarios 
                WHERE organization_id IN (
                    SELECT organization_id FROM profiles 
                    WHERE user_id = auth.uid()
                )
            ))
            OR
            -- For standalone experiences, just check user permissions
            (scenario_id IS NULL)
        )
    );

-- Create index for standalone experiences
CREATE INDEX idx_digital_experiences_is_template ON digital_experiences(is_template);
CREATE INDEX idx_digital_experiences_standalone ON digital_experiences(scenario_id) WHERE scenario_id IS NULL;
