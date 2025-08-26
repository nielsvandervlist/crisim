-- Create utility functions
-- This includes helper functions for the application

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    UPDATE member_invitations 
    SET status = 'expired' 
    WHERE expires_at < NOW() 
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organization info
CREATE OR REPLACE FUNCTION get_user_organization_info(user_uuid UUID)
RETURNS TABLE(
    organization_id UUID,
    organization_name VARCHAR(255),
    organization_slug VARCHAR(255),
    user_role VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.organization_id,
        o.name,
        o.slug,
        p.role
    FROM profiles p
    JOIN organizations o ON p.organization_id = o.id
    WHERE p.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user belongs to organization
CREATE OR REPLACE FUNCTION user_belongs_to_org(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = user_uuid AND organization_id = org_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
