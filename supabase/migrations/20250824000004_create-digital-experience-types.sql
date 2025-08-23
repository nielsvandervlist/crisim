-- Create digital_experience_types table
-- This is a lookup table for different types of digital experiences

CREATE TABLE digital_experience_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_digital_experience_types_name ON digital_experience_types(name);

-- Enable RLS (Row Level Security)
ALTER TABLE digital_experience_types ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy: all authenticated users can view experience types
-- This allows users to see available experience types during scenario creation
CREATE POLICY "All authenticated users can view experience types" ON digital_experience_types
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can manage experience types (create, update, delete)
-- This prevents users from modifying the core experience type definitions
CREATE POLICY "Only admins can manage experience types" ON digital_experience_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
