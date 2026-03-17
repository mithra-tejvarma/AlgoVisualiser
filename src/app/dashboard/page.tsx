"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getRecentVisits, getUserStats } from "@/lib/tracking";
import { algorithmInfoMap } from "@/lib/algorithms";
import {
  BarChart3,
  Clock,
  Activity,
  TrendingUp,
  LogOut,
  User,
  GitCompareArrows,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisitEntry {
  id: string;
  algorithm?: string;
  page?: string;
  timestamp?: { seconds: number };
}

interface Stats {
  totalVisits: number;
  algorithmCounts: Record<string, number>;
}

const algoColors: Record<string, string> = {
  bubble: "from-cyan-500 to-blue-500",
  selection: "from-violet-500 to-pink-500",
  insertion: "from-emerald-500 to-teal-500",
  merge: "from-amber-500 to-orange-500",
};

function getAlgorithmInfo(key?: string) {
  if (!key || !(key in algorithmInfoMap)) {
    return null;
  }
  return algorithmInfoMap[key as keyof typeof algorithmInfoMap];
}

export default function DashboardPage() {
  const { user, loading: authLoading, logOut } = useAuth();
  const router = useRouter();
  const [visits, setVisits] = useState<VisitEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [v, s] = await Promise.all([
          getRecentVisits(user.uid, 30),
          getUserStats(user.uid),
        ]);
        setVisits(v as VisitEntry[]);
        setStats(s as Stats | null);
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      }
      setLoading(false);
    };
    fetchData();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const topAlgorithm = stats?.algorithmCounts
    ? Object.entries(stats.algorithmCounts).sort((a, b) => b[1] - a[1])[0]
    : null;

  const handleLogout = async () => {
    await logOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-cyan-500/25">
              {user.displayName?.[0]?.toUpperCase() || <User className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user.displayName || "User"}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="rounded-xl border border-border text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="glass-card p-5 text-center">
            <Activity className="mx-auto mb-2 h-6 w-6 text-cyan-400" />
            <p className="text-3xl font-bold text-foreground">{stats?.totalVisits ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total Visits</p>
          </div>
          <div className="glass-card p-5 text-center">
            <BarChart3 className="mx-auto mb-2 h-6 w-6 text-violet-400" />
            <p className="text-3xl font-bold text-foreground">
              {stats?.algorithmCounts ? Object.keys(stats.algorithmCounts).length : 0}
            </p>
            <p className="text-xs text-muted-foreground">Algorithms Explored</p>
          </div>
          <div className="glass-card p-5 text-center">
            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
            <p className="text-3xl font-bold text-foreground">
              {topAlgorithm ? getAlgorithmInfo(topAlgorithm[0])?.name ?? topAlgorithm[0] : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Most Used</p>
          </div>
          <div className="glass-card p-5 text-center">
            <Clock className="mx-auto mb-2 h-6 w-6 text-pink-400" />
            <p className="text-3xl font-bold text-foreground">{visits.length}</p>
            <p className="text-xs text-muted-foreground">Recent Sessions</p>
          </div>
        </motion.div>

        {/* Algorithm Usage Breakdown */}
        {stats?.algorithmCounts && Object.keys(stats.algorithmCounts).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card mb-8 p-6"
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Algorithm Usage
            </h2>
            <div className="space-y-3">
              {Object.entries(stats.algorithmCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([algo, count]) => {
                  const total = stats.totalVisits || 1;
                  const pct = Math.round((count / total) * 100);
                  const info = getAlgorithmInfo(algo);
                  return (
                    <div key={algo}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{info?.name ?? algo}</span>
                        <span className="text-muted-foreground">
                          {count} visits ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${algoColors[algo] ?? "from-cyan-500 to-blue-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Recent Activity
          </h2>
          {visits.length === 0 ? (
            <div className="py-12 text-center">
              <Eye className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No activity yet. Start exploring algorithms!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-auto pr-1">
              {visits.map((visit) => {
                const info = getAlgorithmInfo(visit.algorithm);
                const time = visit.timestamp
                  ? new Date(visit.timestamp.seconds * 1000).toLocaleString()
                  : "Unknown";
                return (
                  <div
                    key={visit.id}
                    className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3 transition hover:bg-secondary"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${algoColors[visit.algorithm ?? ""] ?? "from-cyan-500 to-blue-500"}`}
                    >
                      {visit.page === "compare" ? (
                        <GitCompareArrows className="h-4 w-4 text-white" />
                      ) : (
                        <BarChart3 className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {info?.name ?? visit.algorithm ?? "Unknown"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {visit.page === "compare" ? "Compare Mode" : "Visualizer"} · {time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
