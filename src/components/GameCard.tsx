import { useState } from "react";
import { supabase } from "../lib/supabase/client";
import type { GameWithDetails } from "../hooks/useGames";

interface GameCardProps {
  data: GameWithDetails;
  teamMemberId: number;
  onUpdated: () => void;
}

export default function GameCard({ data, teamMemberId, onUpdated }: GameCardProps) {
  const { game, myGameTeam, opponentTeam, myResponse, beerVolunteer, responses } = data;
  const [saving, setSaving] = useState(false);

  const gameTime = game.game_time ? new Date(game.game_time) : null;
  const isPast = gameTime ? gameTime < new Date() : false;
  const isHome = myGameTeam.is_home;

  const attendingCount = responses.filter((r) => r.response.attending).length;

  async function toggleAttendance(attending: boolean) {
    if (isPast || saving) return;
    setSaving(true);

    await supabase.from("game_response").upsert(
      {
        game_team_id: myGameTeam.id,
        team_member_id: teamMemberId,
        attending,
        bringing_beer: attending ? (myResponse?.bringing_beer ?? false) : false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "game_team_id,team_member_id" },
    );

    setSaving(false);
    onUpdated();
  }

  async function volunteerBeer() {
    if (isPast || saving || beerVolunteer) return;
    setSaving(true);

    await supabase.from("game_response").upsert(
      {
        game_team_id: myGameTeam.id,
        team_member_id: teamMemberId,
        attending: myResponse?.attending ?? true,
        bringing_beer: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "game_team_id,team_member_id" },
    );

    setSaving(false);
    onUpdated();
  }

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {gameTime
              ? gameTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : "TBD"}
            {gameTime &&
              " at " +
                gameTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
          </p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {isHome ? "vs" : "@"} {opponentTeam?.name ?? "TBD"}
          </p>
          {game.location && (
            <p className="text-sm text-gray-500">{game.location}</p>
          )}
        </div>
        {isPast && (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
            Past
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <p className="text-sm text-gray-600">
          {attendingCount} attending
        </p>
      </div>

      {!isPast && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggleAttendance(true)}
            disabled={saving}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              myResponse?.attending
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            I'm in
          </button>
          <button
            type="button"
            onClick={() => toggleAttendance(false)}
            disabled={saving}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              myResponse?.attending === false
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Can't make it
          </button>
          <button
            type="button"
            onClick={volunteerBeer}
            disabled={saving || !!beerVolunteer || myResponse?.attending === false}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              beerVolunteer && myResponse?.bringing_beer
                ? "bg-amber-500 text-white"
                : beerVolunteer
                  ? "bg-gray-100 text-gray-400"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
            }`}
          >
            {beerVolunteer
              ? myResponse?.bringing_beer
                ? "I'm bringing beer"
                : `${beerVolunteer.displayName} has beer`
              : "I'll bring beer"}
          </button>
        </div>
      )}
    </div>
  );
}
