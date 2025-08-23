CREATE INDEX idx_session_participants_participant_id_profiles ON public.session_participants USING btree (participant_id);

alter table "public"."session_participants" add constraint "session_participants_participant_id_profiles_fkey" FOREIGN KEY (participant_id) REFERENCES profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."session_participants" validate constraint "session_participants_participant_id_profiles_fkey";


