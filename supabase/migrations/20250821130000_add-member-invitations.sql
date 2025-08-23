-- Add member invitations table
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

-- Create index for faster lookups
CREATE INDEX idx_member_invitations_token ON member_invitations(invitation_token);
CREATE INDEX idx_member_invitations_email ON member_invitations(email);
CREATE INDEX idx_member_invitations_organization ON member_invitations(organization_id);

-- Enable RLS
ALTER TABLE member_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for member_invitations
-- Admins can view all invitations in their organization
CREATE POLICY "Admins can view organization invitations" ON member_invitations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.organization_id = member_invitations.organization_id
            AND profiles.role = 'admin'
        )
    );

-- Admins can create invitations for their organization
CREATE POLICY "Admins can create organization invitations" ON member_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.organization_id = member_invitations.organization_id
            AND profiles.role = 'admin'
        )
    );

-- Admins can update invitations in their organization
CREATE POLICY "Admins can update organization invitations" ON member_invitations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.organization_id = member_invitations.organization_id
            AND profiles.role = 'admin'
        )
    );

-- Anyone can view invitations by token (for accepting)
CREATE POLICY "Anyone can view invitation by token" ON member_invitations
    FOR SELECT USING (true);

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    UPDATE member_invitations 
    SET status = 'expired' 
    WHERE expires_at < NOW() 
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql;
