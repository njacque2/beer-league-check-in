import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase/client";
import type { Tables } from "../lib/supabase/database.types";

type Game = Tables<"games">;
type GameTeam = Tables<"game_teams">;
type GameResponse = Tables<"game_response">;
type Team = Tables<"team">;
type Profile = Tables<"profile">;

export interface GameWithDetails {
  game: Game;
  myGameTeam: GameTeam;
  opponentTeam: Team | null;
  myResponse: GameResponse | null;
  beerVolunteer: { displayName: string } | null;
  responses: Array<{
    response: GameResponse;
    displayName: string;
  }>;
}

async function fetchGames(
  teamId: number,
  teamMemberId: number,
): Promise<GameWithDetails[]> {
  const { data: gameTeams } = await supabase
    .from("game_teams")
    .select("*")
    .eq("team_id", teamId);

  if (!gameTeams?.length) return [];

  const gameIds = gameTeams.map((gt) => gt.game_id!);
  const gameTeamIds = gameTeams.map((gt) => gt.id);

  const [gamesResult, allGameTeamsResult, responsesResult] = await Promise.all([
    supabase
      .from("games")
      .select("*")
      .in("id", gameIds)
      .gte("game_time", new Date().toISOString())
      .order("game_time", { ascending: true }),
    supabase.from("game_teams").select("*").in("game_id", gameIds),
    supabase.from("game_response").select("*").in("game_team_id", gameTeamIds),
  ]);

  if (gamesResult.error) throw new Error("Failed to load games.");

  // Auto-create missing game_response rows with attending=true
  const upcomingMyGameTeamIds = (gamesResult.data ?? [])
    .map((g) => gameTeams.find((gt) => gt.game_id === g.id))
    .filter(Boolean)
    .map((gt) => gt!.id);

  const existingGameTeamIds = new Set(
    (responsesResult.data ?? [])
      .filter((r) => r.team_member_id === teamMemberId)
      .map((r) => r.game_team_id),
  );

  const missingGameTeamIds = upcomingMyGameTeamIds.filter(
    (id) => !existingGameTeamIds.has(id),
  );

  if (missingGameTeamIds.length > 0) {
    const newResponses = missingGameTeamIds.map((gameTeamId) => ({
      game_team_id: gameTeamId,
      team_member_id: teamMemberId,
      attending: true,
      bringing_beer: false,
    }));

    const { data: inserted } = await supabase
      .from("game_response")
      .insert(newResponses)
      .select();

    if (inserted) {
      responsesResult.data = [...(responsesResult.data ?? []), ...inserted];
    }
  }

  const opponentGameTeams = (allGameTeamsResult.data ?? []).filter(
    (gt) => gt.team_id !== teamId,
  );
  const opponentTeamIds = [
    ...new Set(opponentGameTeams.map((gt) => gt.team_id!)),
  ];

  const [teamsResult, membersResult] = await Promise.all([
    opponentTeamIds.length
      ? supabase.from("team").select("*").in("id", opponentTeamIds)
      : Promise.resolve({ data: [] as Team[], error: null }),
    supabase
      .from("team_member")
      .select("*, profile:profile_id(*)")
      .eq("team_id", teamId),
  ]);

  const teamsMap = new Map((teamsResult.data ?? []).map((t) => [t.id, t]));
  const membersMap = new Map(
    (membersResult.data ?? []).map((m) => {
      const profile = m.profile as unknown as Profile | null;
      return [m.id, profile?.display_name ?? "Unknown"];
    }),
  );

  const results: GameWithDetails[] = [];

  for (const game of gamesResult.data ?? []) {
    const myGt = gameTeams.find((gt) => gt.game_id === game.id);
    if (!myGt) continue;

    const opponentGt = opponentGameTeams.find(
      (gt) => gt.game_id === game.id,
    );
    const opponentTeam = opponentGt
      ? (teamsMap.get(opponentGt.team_id!) ?? null)
      : null;

    const gameResponses = (responsesResult.data ?? []).filter(
      (r) => r.game_team_id === myGt.id,
    );

    const myResponse =
      gameResponses.find((r) => r.team_member_id === teamMemberId) ?? null;

    const beerResponse = gameResponses.find((r) => r.bringing_beer);
    const beerVolunteer = beerResponse
      ? {
          displayName:
            membersMap.get(beerResponse.team_member_id!) ?? "Someone",
        }
      : null;

    const responses = gameResponses.map((r) => ({
      response: r,
      displayName: membersMap.get(r.team_member_id!) ?? "Unknown",
    }));

    results.push({
      game,
      myGameTeam: myGt,
      opponentTeam,
      myResponse,
      beerVolunteer,
      responses,
    });
  }

  return results;
}

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; games: GameWithDetails[] }
  | { status: "error"; message: string };

export function useGames(
  teamId: number | undefined,
  teamMemberId: number | undefined,
) {
  const [state, setState] = useState<State>(
    teamId ? { status: "loading" } : { status: "idle" },
  );
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refresh = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!teamId || !teamMemberId) return;

    let cancelled = false;

    fetchGames(teamId, teamMemberId)
      .then((results) => {
        if (!cancelled) setState({ status: "loaded", games: results });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            status: "error",
            message:
              err instanceof Error ? err.message : "Failed to load games.",
          });
      });

    return () => {
      cancelled = true;
    };
  }, [teamId, teamMemberId, refreshCounter]);

  useEffect(() => {
    if (!teamId) return;

    const channel = supabase
      .channel("game_response_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_response" },
        () => refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, refresh]);

  const games = state.status === "loaded" ? state.games : [];
  const loading = state.status === "loading";
  const error = state.status === "error" ? state.message : null;

  return { games, loading, error, refresh };
}
