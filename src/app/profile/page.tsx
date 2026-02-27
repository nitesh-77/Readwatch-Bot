"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Film, Tv, BookOpen, Clapperboard } from "lucide-react";
import Link from "next/link";
import { WatchlistEntry, Category, CATEGORY_LABELS, STATUS_LABELS, Status } from "@/lib/types";

interface Stats {
  total: number;
  byCategory: Record<Category, number>;
  byStatus: Record<Status, number>;
}

function computeStats(entries: WatchlistEntry[]): Stats {
  const byCategory: Record<Category, number> = {
    movie: 0,
    show: 0,
    anime: 0,
    manga: 0,
  };
  const byStatus: Record<Status, number> = {
    plan_to_watch: 0,
    watching: 0,
    completed: 0,
    dropped: 0,
  };

  for (const entry of entries) {
    byCategory[entry.category]++;
    byStatus[entry.status]++;
  }

  return { total: entries.length, byCategory, byStatus };
}

const categoryIcons: Record<Category, typeof Film> = {
  movie: Film,
  show: Tv,
  anime: Clapperboard,
  manga: BookOpen,
};

export default function ProfilePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/list");
        const data = await res.json();
        setStats(computeStats(data.entries || []));
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-dvh pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-bg-primary/90 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-full hover:bg-bg-hover transition-colors text-text-secondary"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-semibold text-text-primary">Profile</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-bg-card animate-pulse" />
            ))}
          </div>
        ) : !stats ? (
          <p className="text-text-muted text-center py-20">
            Failed to load stats
          </p>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Total */}
            <div className="text-center">
              <p className="text-5xl font-bold text-accent">{stats.total}</p>
              <p className="text-sm text-text-muted mt-1">Total Entries</p>
            </div>

            {/* By Category */}
            <div>
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                By Category
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(
                  ([key, label]) => {
                    const Icon = categoryIcons[key];
                    return (
                      <div
                        key={key}
                        className="bg-bg-card rounded-xl p-4 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <Icon size={18} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-text-primary">
                            {stats.byCategory[key]}
                          </p>
                          <p className="text-xs text-text-muted">{label}</p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* By Status */}
            <div>
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                By Status
              </h2>
              <div className="space-y-2">
                {(Object.entries(STATUS_LABELS) as [Status, string][]).map(
                  ([key, label]) => {
                    const percentage =
                      stats.total > 0
                        ? (stats.byStatus[key] / stats.total) * 100
                        : 0;
                    return (
                      <div
                        key={key}
                        className="bg-bg-card rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-text-secondary">
                            {label}
                          </span>
                          <span className="text-sm font-bold text-text-primary">
                            {stats.byStatus[key]}
                          </span>
                        </div>
                        <div className="h-1.5 bg-bg-hover rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              key === "completed"
                                ? "bg-success"
                                : key === "watching"
                                  ? "bg-blue-500"
                                  : key === "plan_to_watch"
                                    ? "bg-accent"
                                    : "bg-danger"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
