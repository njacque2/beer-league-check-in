import { useSession } from "../hooks/useSession";
import { useProfile } from "../hooks/useProfile";
import { useGames } from "../hooks/useGames";
import GameCard from "../components/GameCard";

export default function DashboardPage() {
  const { user } = useSession();
  const { profile, teamMember, team, loading: profileLoading, error: profileError } =
    useProfile(user?.id);
  const { games, loading: gamesLoading, error: gamesError, refresh } = useGames(
    team?.id,
    teamMember?.id,
  );

  if (profileLoading || gamesLoading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  if (profileError) {
    return <p className="text-red-600">{profileError}</p>;
  }

  if (gamesError) {
    return <p className="text-red-600">{gamesError}</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {team?.name ?? "Dashboard"}
        </h2>
        {profile?.display_name && (
          <p className="text-sm text-gray-500">
            Welcome, {profile.display_name}
          </p>
        )}
      </div>

      {games.length === 0 ? (
        <p className="text-gray-500">No upcoming games scheduled.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {games.map((g) => (
            <GameCard
              key={g.game.id}
              data={g}
              teamMemberId={teamMember!.id}
              onUpdated={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
