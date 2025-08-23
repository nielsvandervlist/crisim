-- Add missing SELECT policy for session_participants table
-- This policy allows admins and trainers to view all participants in sessions in their organization

CREATE POLICY "Admins and trainers can view participants in their org" ON "public"."session_participants"
    FOR SELECT USING (
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
