import { useSession } from "../hooks/useSession";
import { useProfile } from "../hooks/useProfile";
import { useGames } from "../hooks/useGames";
import GameCard from "../components/GameCard";
import { DashboardSkeleton } from "../components/Skeleton";

export default function DashboardPage() {
  const { user } = useSession();
  const { profile, teamMember, team, loading: profileLoading, error: profileError } =
    useProfile(user?.id);
  const { games, loading: gamesLoading, error: gamesError, refresh } = useGames(
    team?.id,
    teamMember?.id,
  );

  if (profileLoading || gamesLoading) {
    return <DashboardSkeleton />;
  }

  if (profileError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="font-medium text-red-800">Unable to load profile</p>
        <p className="mt-1 text-sm text-red-600">{profileError}</p>
      </div>
    );
  }

  if (gamesError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="font-medium text-red-800">Unable to load games</p>
        <p className="mt-1 text-sm text-red-600">{gamesError}</p>
      </div>
    );
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
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">No upcoming games scheduled.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {games.map((g, i) => (
            <GameCard
              key={g.game.id}
              data={g}
              teamMemberId={teamMember!.id}
              onUpdated={refresh}
              isNext={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
