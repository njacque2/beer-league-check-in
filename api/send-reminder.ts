import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing authorization header" });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );

  if (authError || !user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const { game_id } = req.body;
  if (!game_id) {
    return res.status(400).json({ error: "game_id is required" });
  }

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", game_id)
    .single();

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const { data: gameTeams } = await supabase
    .from("game_teams")
    .select("*")
    .eq("game_id", game_id);

  if (!gameTeams?.length) {
    return res.status(404).json({ error: "No teams for this game" });
  }

  const gameTeamIds = gameTeams.map((gt) => gt.id);

  const [responsesResult, membersResult] = await Promise.all([
    supabase
      .from("game_response")
      .select("*")
      .in("game_team_id", gameTeamIds),
    supabase
      .from("team_member")
      .select("*, profile:profile_id(*, user:user_id(email))")
      .in("team_id", gameTeams.map((gt) => gt.team_id!)),
  ]);

  const respondedMemberIds = new Set(
    (responsesResult.data ?? []).map((r) => r.team_member_id),
  );

  const nonResponders = (membersResult.data ?? []).filter(
    (m) => !respondedMemberIds.has(m.id),
  );

  const resend = new Resend(process.env.RESEND_API_KEY);

  const gameTime = game.game_time
    ? new Date(game.game_time).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "TBD";

  const emails = nonResponders
    .map((m) => {
      const profile = m.profile as Record<string, unknown> | null;
      const authUser = profile?.user as Record<string, unknown> | null;
      const email = authUser?.email as string | undefined;
      const name = (profile?.display_name as string) ?? "Player";
      if (!email) return null;
      return { email, name };
    })
    .filter(Boolean) as Array<{ email: string; name: string }>;

  let sent = 0;
  for (const { email, name } of emails) {
    try {
      await resend.emails.send({
        from: "Beer League <noreply@yourdomain.com>",
        to: email,
        subject: `Game reminder: ${gameTime}`,
        html: `<p>Hey ${name},</p><p>You haven't responded for the game on <strong>${gameTime}</strong> at ${game.location ?? "TBD"}.</p><p>Log in to check in!</p>`,
      });
      sent++;
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  return res.status(200).json({ sent, total: emails.length });
}
