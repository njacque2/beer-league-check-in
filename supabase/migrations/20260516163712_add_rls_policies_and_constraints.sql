-- Unique constraint needed for game_response upsert on (game_team_id, team_member_id)
ALTER TABLE "public"."game_response"
  ADD CONSTRAINT "game_response_game_team_id_team_member_id_key"
  UNIQUE ("game_team_id", "team_member_id");

-- Grant permissions to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO "authenticated";
GRANT INSERT, UPDATE ON "public"."game_response" TO "authenticated";

-- Grant all to service_role
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "service_role";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "public" TO "authenticated";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "public" TO "service_role";

-- RLS policies: authenticated users can read all rows
CREATE POLICY "Authenticated users can read all" ON "public"."league"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read all" ON "public"."season"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read all" ON "public"."team"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read all" ON "public"."team_member"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read all" ON "public"."profile"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read all" ON "public"."games"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read all" ON "public"."game_teams"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read all" ON "public"."game_response"
  FOR SELECT TO authenticated USING (true);

-- RLS policy: users can insert/update their own game_response rows
CREATE POLICY "Users can insert own game_response" ON "public"."game_response"
  FOR INSERT TO authenticated
  WITH CHECK (
    team_member_id IN (
      SELECT tm.id FROM team_member tm
      JOIN profile p ON p.id = tm.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own game_response" ON "public"."game_response"
  FOR UPDATE TO authenticated
  USING (
    team_member_id IN (
      SELECT tm.id FROM team_member tm
      JOIN profile p ON p.id = tm.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Enable realtime for game_response
ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."game_response";
