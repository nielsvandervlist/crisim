-- Add invitations table for member invitations
CREATE TABLE IF NOT EXISTS invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    invited_by UUID REFERENCES profiles(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
    token UUID DEFAULT gen_random_uuid(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_organization_id ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- Row Level Security
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations in their organization" ON invitations
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
