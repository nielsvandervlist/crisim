alter table "public"."session_participants" drop constraint "session_participants_participant_id_profiles_fkey";

drop index if exists "public"."idx_session_participants_participant_id_profiles";


