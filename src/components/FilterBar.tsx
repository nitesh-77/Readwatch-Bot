"use client";

import { Category, CATEGORY_LABELS, Status, STATUS_LABELS } from "@/lib/types";

interface FilterBarProps {
  activeCategory: Category | "all";
  activeStatus: Status | "all";
  onCategoryChange: (category: Category | "all") => void;
  onStatusChange: (status: Status | "all") => void;
}

export default function FilterBar({
  activeCategory,
  activeStatus,
  onCategoryChange,
  onStatusChange,
}: FilterBarProps) {
  const categories: (Category | "all")[] = [
    "all",
    "movie",
    "show",
    "anime",
    "manga",
  ];
  const statuses: (Status | "all")[] = [
    "all",
    "plan_to_watch",
    "watching",
    "completed",
    "dropped",
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? "bg-accent text-white filter-pill-active"
                : "bg-bg-card text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => onStatusChange(st)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200 ${
              activeStatus === st
                ? "bg-bg-hover text-text-primary border border-accent/50"
                : "bg-transparent text-text-muted hover:text-text-secondary border border-border"
            }`}
          >
            {st === "all" ? "All Status" : STATUS_LABELS[st]}
          </button>
        ))}
      </div>
    </div>
  );
}
