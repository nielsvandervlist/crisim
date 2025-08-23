-- Add missing SELECT policy for training_sessions table
-- This policy allows admins and trainers to view training sessions in their organization

CREATE POLICY "Admins and trainers can view sessions in their org" ON "public"."training_sessions"
    FOR SELECT USING (
        "organization_id" IN (
            SELECT "profiles"."organization_id"
            FROM "public"."profiles"
            WHERE (
                "profiles"."user_id" = "auth"."uid"() 
                AND "profiles"."role" IN ('admin', 'trainer')
            )
        )
    );
