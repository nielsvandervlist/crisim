-- Create documents table
-- This stores training materials and documents for scenarios

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER, -- in bytes
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_documents_scenario_id ON documents(scenario_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_file_type ON documents(file_type);

-- Enable RLS (Row Level Security)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for documents table
-- Organization members can view documents for scenarios in their organization
CREATE POLICY "Organization members can view documents" ON documents
    FOR SELECT USING (
        scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND organization_id IS NOT NULL
            )
        )
    );

-- Organization admins and trainers can create documents
CREATE POLICY "Admins and trainers can create documents" ON documents
    FOR INSERT WITH CHECK (
        scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

-- Organization admins and trainers can update documents
CREATE POLICY "Admins and trainers can update documents" ON documents
    FOR UPDATE USING (
        scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );

-- Organization admins and trainers can delete documents
CREATE POLICY "Admins and trainers can delete documents" ON documents
    FOR DELETE USING (
        scenario_id IN (
            SELECT id FROM scenarios 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
            )
        )
    );
