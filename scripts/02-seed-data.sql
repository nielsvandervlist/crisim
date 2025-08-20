-- Seed data for development and testing

-- Insert sample organization
INSERT INTO organizations (id, name, slug) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Crisis Training Corp', 'crisis-training-corp');

-- Insert sample crisis scenarios
INSERT INTO scenarios (id, organization_id, title, description, crisis_type, difficulty_level, estimated_duration) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Data Breach Response',
    'A major data breach has been discovered affecting customer personal information. Practice coordinated response across communications, legal, and technical teams.',
    'cybersecurity',
    'intermediate',
    90
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002', 
    '550e8400-e29b-41d4-a716-446655440000',
    'Natural Disaster Response',
    'A major earthquake has impacted your primary office location. Coordinate business continuity and employee safety response.',
    'natural_disaster',
    'advanced',
    120
  );

-- Insert sample digital experiences for data breach scenario
INSERT INTO digital_experiences (scenario_id, type, platform, title, content, author_name, timestamp_offset) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'social_media',
    'Twitter',
    'Customer Complaint',
    'Just got an email saying my data was compromised by @YourCompany. This is unacceptable! #databreach #privacy',
    'AngryCustoner123',
    15
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'news_article',
    'TechCrunch',
    'Major Data Breach Reported',
    'Sources report that YourCompany has experienced a significant data breach affecting thousands of customers. The company has not yet issued an official statement.',
    'Tech Reporter',
    30
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'email',
    'Internal Email',
    'URGENT: Security Incident Response',
    'Team, we have confirmed unauthorized access to our customer database. Legal and PR teams need to coordinate response immediately. All hands meeting in 10 minutes.',
    'CTO',
    5
  );
