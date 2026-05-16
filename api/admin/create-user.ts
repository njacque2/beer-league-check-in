import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());

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

  if (!ADMIN_EMAILS.includes(user.email ?? "")) {
    return res.status(403).json({ error: "Not an admin" });
  }

  const { email, display_name, team_id } = req.body;
  if (!email || !display_name || !team_id) {
    return res.status(400).json({ error: "email, display_name, and team_id are required" });
  }

  try {
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (createError || !authData.user) {
      return res.status(400).json({ error: createError?.message ?? "Failed to create user" });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .insert({ user_id: authData.user.id, display_name })
      .select()
      .single();

    if (profileError || !profile) {
      return res.status(500).json({ error: "Failed to create profile" });
    }

    const { error: memberError } = await supabase
      .from("team_member")
      .insert({ team_id, profile_id: profile.id, role: "player" });

    if (memberError) {
      return res.status(500).json({ error: "Failed to create team membership" });
    }

    return res.status(201).json({
      user_id: authData.user.id,
      profile_id: profile.id,
      email,
      display_name,
    });
  } catch (err) {
    Sentry.captureException(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
