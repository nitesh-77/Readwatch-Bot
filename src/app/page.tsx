"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, User } from "lucide-react";
import Link from "next/link";
import { WatchlistEntry, Category, Status, SearchResult } from "@/lib/types";
import PosterCard from "@/components/PosterCard";
import FilterBar from "@/components/FilterBar";
import SearchModal from "@/components/SearchModal";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [activeStatus, setActiveStatus] = useState<Status | "all">("all");
  const [searchOpen, setSearchOpen] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (activeStatus !== "all") params.set("status", activeStatus);

      const res = await fetch(`/api/list?${params.toString()}`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeStatus]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAdd = async (result: SearchResult, status: Status) => {
    try {
      const res = await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          category: result.category,
          status,
          external_id: result.external_id,
          poster_url: result.poster_url,
        }),
      });

      if (res.ok) {
        setSearchOpen(false);
        fetchEntries();
      }
    } catch {
      // silently fail
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await fetch("/api/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      // silently fail
    }
  };

  const handleStatusChange = async (id: string, status: Status) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;

    try {
      await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: entry.title,
          category: entry.category,
          status,
          external_id: entry.external_id,
          poster_url: entry.poster_url,
        }),
      });
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      );
    } catch {
      // silently fail
    }
  };

  return (
    <main className="min-h-dvh pb-20 sm:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-bg-primary/90 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-accent">Read</span>
            <span className="text-text-primary">Watch</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-bg-hover transition-colors text-text-secondary hover:text-text-primary"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <Link
              href="/profile"
              className="p-2 rounded-full hover:bg-bg-hover transition-colors text-text-secondary hover:text-text-primary"
              aria-label="Profile"
            >
              <User size={20} />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-5">
        {/* Filters */}
        <FilterBar
          activeCategory={activeCategory}
          activeStatus={activeStatus}
          onCategoryChange={setActiveCategory}
          onStatusChange={setActiveStatus}
        />

        {/* Entry count */}
        <div className="mt-4 mb-3 flex items-center justify-between">
          <p className="text-xs text-text-muted">
            {loading ? "Loading..." : `${entries.length} entries`}
          </p>
        </div>

        {/* Poster Grid */}
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-lg bg-bg-card animate-pulse"
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-bg-card flex items-center justify-center mb-4">
              <Plus size={24} className="text-text-muted" />
            </div>
            <p className="text-text-secondary text-sm font-medium">
              Nothing here yet
            </p>
            <p className="text-text-muted text-xs mt-1">
              Search and add your first entry
            </p>
            <button
              onClick={() => setSearchOpen(true)}
              className="mt-4 px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-full transition-colors"
            >
              Add Media
            </button>
          </div>
        ) : (
          <div className="poster-grid grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {entries.map((entry) => (
              <PosterCard
                key={entry.id}
                entry={entry}
                onRemove={handleRemove}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setSearchOpen(true)}
        className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 w-14 h-14 bg-accent hover:bg-accent-hover text-white rounded-full shadow-lg shadow-accent/30 flex items-center justify-center transition-all hover:scale-110 z-30"
        aria-label="Add media"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Nav (mobile) */}
      <BottomNav />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAdd={handleAdd}
      />
    </main>
  );
}
