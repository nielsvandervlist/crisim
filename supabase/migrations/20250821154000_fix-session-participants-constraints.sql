-- Fix conflicting foreign key constraints on session_participants.participant_id
-- Remove the constraint to auth.users and keep only the one to profiles.user_id

-- Drop the existing constraint to auth.users
ALTER TABLE "public"."session_participants" 
DROP CONSTRAINT IF EXISTS "session_participants_participant_id_fkey";

-- Ensure the constraint to profiles.user_id exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'session_participants_participant_id_profiles_fkey'
        AND table_name = 'session_participants'
    ) THEN
        ALTER TABLE "public"."session_participants" 
        ADD CONSTRAINT "session_participants_participant_id_profiles_fkey" 
        FOREIGN KEY ("participant_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;
    END IF;
END $$;
