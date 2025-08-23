

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."cleanup_expired_invitations"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE member_invitations 
    SET status = 'expired' 
    WHERE expires_at < NOW() 
    AND status = 'pending';
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_invitations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_invitation_token"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;


ALTER FUNCTION "public"."generate_invitation_token"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."digital_experience_types" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."digital_experience_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."digital_experiences" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "scenario_id" "uuid" NOT NULL,
    "type_id" "uuid" NOT NULL,
    "title" character varying(255),
    "content" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "trigger_time" integer DEFAULT 0,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."digital_experiences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "scenario_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "file_path" character varying(500) NOT NULL,
    "file_type" character varying(50) NOT NULL,
    "file_size" integer,
    "uploaded_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."member_invitations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" character varying(255) NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "role" character varying(50) NOT NULL,
    "invited_by" "uuid" NOT NULL,
    "invitation_token" character varying(255) NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "member_invitations_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['admin'::character varying, 'trainer'::character varying, 'participant'::character varying])::"text"[]))),
    CONSTRAINT "member_invitations_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'expired'::character varying])::"text"[])))
);


ALTER TABLE "public"."member_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."participant_responses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "participant_id" "uuid" NOT NULL,
    "digital_experience_id" "uuid",
    "response_type" character varying(50) DEFAULT 'reaction'::character varying NOT NULL,
    "response_content" "text",
    "reaction_time" integer,
    "response_time" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."participant_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "email" character varying(255) NOT NULL,
    "full_name" character varying(255),
    "role" character varying(50) NOT NULL,
    "organization_id" "uuid",
    "email_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['admin'::character varying, 'trainer'::character varying, 'participant'::character varying])::"text"[])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scenarios" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "crisis_type" character varying(100) NOT NULL,
    "difficulty_level" character varying(50) NOT NULL,
    "estimated_duration" integer NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."scenarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session_participants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "participant_id" "uuid" NOT NULL,
    "role_assignment" character varying(50) DEFAULT 'participant'::character varying NOT NULL,
    "invited_at" timestamp with time zone DEFAULT "now"(),
    "joined_at" timestamp with time zone,
    "status" character varying(50) DEFAULT 'invited'::character varying NOT NULL,
    CONSTRAINT "session_participants_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['invited'::character varying, 'accepted'::character varying, 'declined'::character varying, 'completed'::character varying])::"text"[])))
);


ALTER TABLE "public"."session_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "scenario_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "status" character varying(50) DEFAULT 'draft'::character varying NOT NULL,
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "training_sessions_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'paused'::character varying, 'completed'::character varying])::"text"[])))
);


ALTER TABLE "public"."training_sessions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."digital_experience_types"
    ADD CONSTRAINT "digital_experience_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."digital_experience_types"
    ADD CONSTRAINT "digital_experience_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."digital_experiences"
    ADD CONSTRAINT "digital_experiences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."member_invitations"
    ADD CONSTRAINT "member_invitations_invitation_token_key" UNIQUE ("invitation_token");



ALTER TABLE ONLY "public"."member_invitations"
    ADD CONSTRAINT "member_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."participant_responses"
    ADD CONSTRAINT "participant_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."scenarios"
    ADD CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_participants"
    ADD CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_participants"
    ADD CONSTRAINT "session_participants_session_id_participant_id_key" UNIQUE ("session_id", "participant_id");



ALTER TABLE ONLY "public"."training_sessions"
    ADD CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_digital_experiences_scenario_id" ON "public"."digital_experiences" USING "btree" ("scenario_id");



CREATE INDEX "idx_documents_scenario_id" ON "public"."documents" USING "btree" ("scenario_id");



CREATE INDEX "idx_member_invitations_email" ON "public"."member_invitations" USING "btree" ("email");



CREATE INDEX "idx_member_invitations_organization" ON "public"."member_invitations" USING "btree" ("organization_id");



CREATE INDEX "idx_member_invitations_token" ON "public"."member_invitations" USING "btree" ("invitation_token");



CREATE INDEX "idx_organizations_slug" ON "public"."organizations" USING "btree" ("slug");



CREATE INDEX "idx_participant_responses_participant_id" ON "public"."participant_responses" USING "btree" ("participant_id");



CREATE INDEX "idx_participant_responses_session_id" ON "public"."participant_responses" USING "btree" ("session_id");



CREATE INDEX "idx_profiles_organization_id" ON "public"."profiles" USING "btree" ("organization_id");



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "idx_scenarios_organization_id" ON "public"."scenarios" USING "btree" ("organization_id");



CREATE INDEX "idx_session_participants_participant_id" ON "public"."session_participants" USING "btree" ("participant_id");



CREATE INDEX "idx_session_participants_session_id" ON "public"."session_participants" USING "btree" ("session_id");



CREATE INDEX "idx_training_sessions_organization_id" ON "public"."training_sessions" USING "btree" ("organization_id");



CREATE INDEX "idx_training_sessions_scenario_id" ON "public"."training_sessions" USING "btree" ("scenario_id");



ALTER TABLE ONLY "public"."digital_experiences"
    ADD CONSTRAINT "digital_experiences_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."digital_experiences"
    ADD CONSTRAINT "digital_experiences_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."digital_experiences"
    ADD CONSTRAINT "digital_experiences_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."digital_experience_types"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."member_invitations"
    ADD CONSTRAINT "member_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."member_invitations"
    ADD CONSTRAINT "member_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."participant_responses"
    ADD CONSTRAINT "participant_responses_digital_experience_id_fkey" FOREIGN KEY ("digital_experience_id") REFERENCES "public"."digital_experiences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."participant_responses"
    ADD CONSTRAINT "participant_responses_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."participant_responses"
    ADD CONSTRAINT "participant_responses_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scenarios"
    ADD CONSTRAINT "scenarios_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."scenarios"
    ADD CONSTRAINT "scenarios_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_participants"
    ADD CONSTRAINT "session_participants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."session_participants"
    ADD CONSTRAINT "session_participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_sessions"
    ADD CONSTRAINT "training_sessions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."training_sessions"
    ADD CONSTRAINT "training_sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_sessions"
    ADD CONSTRAINT "training_sessions_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE CASCADE;



CREATE POLICY "Admins and trainers can manage documents in their org" ON "public"."documents" USING (("scenario_id" IN ( SELECT "scenarios"."id"
   FROM "public"."scenarios"
  WHERE ("scenarios"."organization_id" IN ( SELECT "profiles"."organization_id"
           FROM "public"."profiles"
          WHERE (("profiles"."user_id" = "auth"."uid"()) AND (("profiles"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'trainer'::character varying])::"text"[]))))))));



CREATE POLICY "Admins and trainers can manage experiences in their org" ON "public"."digital_experiences" USING (("scenario_id" IN ( SELECT "scenarios"."id"
   FROM "public"."scenarios"
  WHERE ("scenarios"."organization_id" IN ( SELECT "profiles"."organization_id"
           FROM "public"."profiles"
          WHERE (("profiles"."user_id" = "auth"."uid"()) AND (("profiles"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'trainer'::character varying])::"text"[]))))))));



CREATE POLICY "Admins and trainers can manage participants in their org" ON "public"."session_participants" USING (("session_id" IN ( SELECT "training_sessions"."id"
   FROM "public"."training_sessions"
  WHERE ("training_sessions"."organization_id" IN ( SELECT "profiles"."organization_id"
           FROM "public"."profiles"
          WHERE (("profiles"."user_id" = "auth"."uid"()) AND (("profiles"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'trainer'::character varying])::"text"[]))))))));



CREATE POLICY "Admins and trainers can manage scenarios in their org" ON "public"."scenarios" USING (("organization_id" IN ( SELECT "profiles"."organization_id"
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND (("profiles"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'trainer'::character varying])::"text"[]))))));



CREATE POLICY "Admins and trainers can manage sessions in their org" ON "public"."training_sessions" USING (("organization_id" IN ( SELECT "profiles"."organization_id"
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND (("profiles"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'trainer'::character varying])::"text"[]))))));



CREATE POLICY "Admins and trainers can view responses in their org" ON "public"."participant_responses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."training_sessions" "ts"
     JOIN "public"."profiles" "p" ON (("ts"."organization_id" = "p"."organization_id")))
  WHERE (("ts"."id" = "participant_responses"."session_id") AND ("p"."user_id" = "auth"."uid"()) AND (("p"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'trainer'::character varying])::"text"[]))))));



CREATE POLICY "Admins can create organization invitations" ON "public"."member_invitations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."organization_id" = "member_invitations"."organization_id") AND (("profiles"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Admins can update organization invitations" ON "public"."member_invitations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."organization_id" = "member_invitations"."organization_id") AND (("profiles"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Admins can view organization invitations" ON "public"."member_invitations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."organization_id" = "member_invitations"."organization_id") AND (("profiles"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "All authenticated users can view digital experience types" ON "public"."digital_experience_types" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Anyone can view invitation by token" ON "public"."member_invitations" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create organizations" ON "public"."organizations" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view organizations" ON "public"."organizations" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view organizations for profile creation" ON "public"."organizations" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Basic user insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Basic user update own profile" ON "public"."profiles" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Basic user view own profile" ON "public"."profiles" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Participants can insert their own responses" ON "public"."participant_responses" FOR INSERT WITH CHECK (("participant_id" = "auth"."uid"()));



CREATE POLICY "Participants can view documents in their org" ON "public"."documents" FOR SELECT USING (("scenario_id" IN ( SELECT "scenarios"."id"
   FROM "public"."scenarios"
  WHERE ("scenarios"."organization_id" IN ( SELECT "profiles"."organization_id"
           FROM "public"."profiles"
          WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."organization_id" IS NOT NULL)))))));



CREATE POLICY "Participants can view experiences in their org" ON "public"."digital_experiences" FOR SELECT USING (("scenario_id" IN ( SELECT "scenarios"."id"
   FROM "public"."scenarios"
  WHERE ("scenarios"."organization_id" IN ( SELECT "profiles"."organization_id"
           FROM "public"."profiles"
          WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."organization_id" IS NOT NULL)))))));



CREATE POLICY "Participants can view scenarios in their org" ON "public"."scenarios" FOR SELECT USING (("organization_id" IN ( SELECT "profiles"."organization_id"
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."organization_id" IS NOT NULL)))));



CREATE POLICY "Participants can view sessions in their org" ON "public"."training_sessions" FOR SELECT USING (("organization_id" IN ( SELECT "profiles"."organization_id"
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."organization_id" IS NOT NULL)))));



CREATE POLICY "Participants can view their own invitations" ON "public"."session_participants" FOR SELECT USING (("participant_id" = "auth"."uid"()));



CREATE POLICY "Participants can view their own responses" ON "public"."participant_responses" FOR SELECT USING (("participant_id" = "auth"."uid"()));



ALTER TABLE "public"."digital_experience_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."digital_experiences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."member_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."participant_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scenarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."session_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_sessions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."cleanup_expired_invitations"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_invitations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_invitations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_invitation_token"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_invitation_token"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_invitation_token"() TO "service_role";


















GRANT ALL ON TABLE "public"."digital_experience_types" TO "anon";
GRANT ALL ON TABLE "public"."digital_experience_types" TO "authenticated";
GRANT ALL ON TABLE "public"."digital_experience_types" TO "service_role";



GRANT ALL ON TABLE "public"."digital_experiences" TO "anon";
GRANT ALL ON TABLE "public"."digital_experiences" TO "authenticated";
GRANT ALL ON TABLE "public"."digital_experiences" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."member_invitations" TO "anon";
GRANT ALL ON TABLE "public"."member_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."member_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."participant_responses" TO "anon";
GRANT ALL ON TABLE "public"."participant_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."participant_responses" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."scenarios" TO "anon";
GRANT ALL ON TABLE "public"."scenarios" TO "authenticated";
GRANT ALL ON TABLE "public"."scenarios" TO "service_role";



GRANT ALL ON TABLE "public"."session_participants" TO "anon";
GRANT ALL ON TABLE "public"."session_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."session_participants" TO "service_role";



GRANT ALL ON TABLE "public"."training_sessions" TO "anon";
GRANT ALL ON TABLE "public"."training_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."training_sessions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
