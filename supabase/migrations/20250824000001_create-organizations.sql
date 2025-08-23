-- Create organizations table
-- This is the foundation table with no dependencies

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_name ON organizations(name);

-- Enable RLS (Row Level Security)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy: authenticated users can view organizations
-- This allows users to see available organizations during signup
CREATE POLICY "Authenticated users can view organizations" ON organizations
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Basic RLS policy: authenticated users can create organizations
-- This allows users to create their own organization during signup
CREATE POLICY "Authenticated users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Basic RLS policy: organization admins can update their organization
-- This will be refined when we add the profiles table
CREATE POLICY "Organization admins can update their organization" ON organizations
    FOR UPDATE USING (true);

-- Basic RLS policy: organization admins can delete their organization
-- This will be refined when we add the profiles table
CREATE POLICY "Organization admins can delete their organization" ON organizations
    FOR DELETE USING (true);
