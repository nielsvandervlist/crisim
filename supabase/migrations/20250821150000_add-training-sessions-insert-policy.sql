-- Add missing INSERT policy for training_sessions table
-- This policy allows admins and trainers to create training sessions in their organization

CREATE POLICY "Admins and trainers can create sessions in their org" ON "public"."training_sessions"
    FOR INSERT WITH CHECK (
        "organization_id" IN (
            SELECT "profiles"."organization_id"
            FROM "public"."profiles"
            WHERE (
                "profiles"."user_id" = "auth"."uid"() 
                AND "profiles"."role" IN ('admin', 'trainer')
            )
        )
    );

-- Add missing UPDATE policy for training_sessions table
-- This policy allows admins and trainers to update training sessions in their organization

CREATE POLICY "Admins and trainers can update sessions in their org" ON "public"."training_sessions"
    FOR UPDATE USING (
        "organization_id" IN (
            SELECT "profiles"."organization_id"
            FROM "public"."profiles"
            WHERE (
                "profiles"."user_id" = "auth"."uid"() 
                AND "profiles"."role" IN ('admin', 'trainer')
            )
        )
    );

-- Add missing DELETE policy for training_sessions table
-- This policy allows admins and trainers to delete training sessions in their organization

CREATE POLICY "Admins and trainers can delete sessions in their org" ON "public"."training_sessions"
    FOR DELETE USING (
        "organization_id" IN (
            SELECT "profiles"."organization_id"
            FROM "public"."profiles"
            WHERE (
                "profiles"."user_id" = "auth"."uid"() 
                AND "profiles"."role" IN ('admin', 'trainer')
            )
        )
    );

-- Add missing INSERT policy for session_participants table
-- This policy allows admins and trainers to add participants to sessions in their organization

CREATE POLICY "Admins and trainers can add participants to sessions in their org" ON "public"."session_participants"
    FOR INSERT WITH CHECK (
        "session_id" IN (
            SELECT "training_sessions"."id"
            FROM "public"."training_sessions"
            WHERE "training_sessions"."organization_id" IN (
                SELECT "profiles"."organization_id"
                FROM "public"."profiles"
                WHERE (
                    "profiles"."user_id" = "auth"."uid"() 
                    AND "profiles"."role" IN ('admin', 'trainer')
                )
            )
        )
    );

-- Add missing UPDATE policy for session_participants table
-- This policy allows admins and trainers to update participant records in their organization

CREATE POLICY "Admins and trainers can update participants in their org" ON "public"."session_participants"
    FOR UPDATE USING (
        "session_id" IN (
            SELECT "training_sessions"."id"
            FROM "public"."training_sessions"
            WHERE "training_sessions"."organization_id" IN (
                SELECT "profiles"."organization_id"
                FROM "public"."profiles"
                WHERE (
                    "profiles"."user_id" = "auth"."uid"() 
                    AND "profiles"."role" IN ('admin', 'trainer')
                )
            )
        )
    );

-- Add missing DELETE policy for session_participants table
-- This policy allows admins and trainers to remove participants from sessions in their organization

CREATE POLICY "Admins and trainers can remove participants from sessions in their org" ON "public"."session_participants"
    FOR DELETE USING (
        "session_id" IN (
            SELECT "training_sessions"."id"
            FROM "public"."training_sessions"
            WHERE "training_sessions"."organization_id" IN (
                SELECT "profiles"."organization_id"
                FROM "public"."profiles"
                WHERE (
                    "profiles"."user_id" = "auth"."uid"() 
                    AND "profiles"."role" IN ('admin', 'trainer')
                )
            )
        )
    );
