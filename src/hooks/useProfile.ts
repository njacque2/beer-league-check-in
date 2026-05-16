import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import type { Tables } from "../lib/supabase/database.types";

type Profile = Tables<"profile">;
type TeamMember = Tables<"team_member">;
type Team = Tables<"team">;

interface ProfileData {
  profile: Profile;
  teamMember: TeamMember;
  team: Team;
}

export function useProfile(userId: string | undefined) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data: profile, error: profileErr } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", userId!)
        .single();

      if (cancelled) return;

      if (profileErr || !profile) {
        setError("Profile not found. Contact an admin to get set up.");
        setLoading(false);
        return;
      }

      const { data: teamMember, error: tmErr } = await supabase
        .from("team_member")
        .select("*")
        .eq("profile_id", profile.id)
        .single();

      if (cancelled) return;

      if (tmErr || !teamMember) {
        setError("No team membership found. Contact an admin.");
        setLoading(false);
        return;
      }

      const { data: team, error: teamErr } = await supabase
        .from("team")
        .select("*")
        .eq("id", teamMember.team_id!)
        .single();

      if (cancelled) return;

      if (teamErr || !team) {
        setError("Team not found.");
        setLoading(false);
        return;
      }

      setData({ profile, teamMember, team });
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { ...data, loading, error };
}
