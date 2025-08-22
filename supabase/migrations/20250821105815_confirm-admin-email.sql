-- Confirm admin user email and create profile
-- This migration handles the admin user setup

-- First, confirm the admin user's email
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'niels.vder.vlist@gmail.com';

-- Get the admin user's ID
DO $$
DECLARE
    admin_user_id UUID;
    default_org_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'niels.vder.vlist@gmail.com';
    
    -- Get default organization ID
    SELECT id INTO default_org_id 
    FROM organizations 
    WHERE slug = 'default-org';
    
    -- Create admin profile if it doesn't exist
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO profiles (user_id, email, full_name, role, organization_id)
        VALUES (admin_user_id, 'niels.vder.vlist@gmail.com', 'Niels van der Vlist', 'admin', default_org_id)
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Admin user confirmed and profile created/updated';
    ELSE
        RAISE NOTICE 'Admin user not found';
    END IF;
END $$;
