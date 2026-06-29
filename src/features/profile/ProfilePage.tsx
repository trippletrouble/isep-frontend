import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { getUserProfile, getUserStats } from "@/api/users.api";
import type { PlayerProfile, PlayerStats } from "@/api/types";

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [fetchedId, setFetchedId] = useState<string | undefined>(undefined);
  const isLoading = !!userId && fetchedId !== userId;

  useEffect(() => {
    if (!userId) return;

    Promise.all([getUserProfile(userId), getUserStats(userId)])
      .then(([p, s]) => {
        setProfile(p);
        setStats(s);
        setFetchedId(userId);
      })
      .catch(() => navigate("/"));
  }, [userId, navigate]);

  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="bg-white/5 border border-accent rounded-3xl p-8 flex flex-col items-center gap-6">
        {/* Avatar */}
        {isLoading ? (
          <SkeletonCard className="w-20 h-20 rounded-full" />
        ) : profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.username}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#57DB8F] flex items-center justify-center">
            <span className="text-[#292929] font-lilita text-2xl">
              {initials}
            </span>
          </div>
        )}

        {/* Username */}
        {isLoading ? (
          <SkeletonCard className="h-8 w-40" />
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="font-lilita text-white text-3xl">
              {profile?.username}
            </h1>
            {profile?.isGuest && (
              <span className="text-xs bg-white/10 text-[#ACACAC] px-2 py-1 rounded-full font-afacad">
                Gast
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="w-full border-t border-accent pt-6">
          <h2 className="font-lilita text-white text-xl uppercase mb-4 text-center">
            Statistiken
          </h2>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <SkeletonCard className="h-4 w-32" />
                  <SkeletonCard className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="flex flex-col gap-3 font-afacad">
              {[
                ["Gespielte Spiele", stats.gamesPlayed],
                ["Gewonnen", stats.gamesWon],
                ["Verloren", stats.gamesLost],
                ["Siegquote", `${Math.round((stats.winRatio ?? 0) * 100)} %`],
                ["Figuren geschlagen", stats.totalFiguresCaptured],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-[#ACACAC]">{label}</span>
                  <span className="text-white font-semibold">{value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
