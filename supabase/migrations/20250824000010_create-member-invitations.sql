-- Create member_invitations table
-- This handles organization invitations for new members

CREATE TABLE member_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'trainer', 'participant')),
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_member_invitations_token ON member_invitations(invitation_token);
CREATE INDEX idx_member_invitations_email ON member_invitations(email);
CREATE INDEX idx_member_invitations_organization ON member_invitations(organization_id);
CREATE INDEX idx_member_invitations_status ON member_invitations(status);
CREATE INDEX idx_member_invitations_expires_at ON member_invitations(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE member_invitations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for member_invitations table
-- Anyone can view invitations by token (for accepting)
CREATE POLICY "Anyone can view invitation by token" ON member_invitations
    FOR SELECT USING (true);

-- Organization admins can view invitations in their organization
CREATE POLICY "Admins can view organization invitations" ON member_invitations
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Organization admins can create invitations for their organization
CREATE POLICY "Admins can create organization invitations" ON member_invitations
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Organization admins can update invitations in their organization
CREATE POLICY "Admins can update organization invitations" ON member_invitations
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Organization admins can delete invitations in their organization
CREATE POLICY "Admins can delete organization invitations" ON member_invitations
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
