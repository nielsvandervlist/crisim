-- Seed initial data
-- This adds default organization and experience types

-- Insert default digital experience types
INSERT INTO digital_experience_types (name, description) VALUES
    ('social_media', 'Social media posts (Facebook, Twitter, etc.)'),
    ('news', 'News articles and media coverage'),
    ('email', 'Email communications'),
    ('video', 'Video content and broadcasts'),
    ('phone_call', 'Phone call transcripts'),
    ('document', 'Official documents and reports'),
    ('sms', 'Text messages and SMS'),
    ('press_release', 'Press releases and official statements');

-- Create a default organization
INSERT INTO organizations (name, slug, description) 
VALUES ('Default Organization', 'default-org', 'Default organization for the crisis management training platform');

-- Note: We don't create default profiles here as they should be created during user signup
-- Note: We don't create default scenarios here as they should be created by users
