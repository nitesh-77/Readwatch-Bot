"use client";

import { WatchlistEntry, STATUS_LABELS, Status } from "@/lib/types";
import { Trash2, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface PosterCardProps {
  entry: WatchlistEntry;
  onRemove: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
}

export default function PosterCard({
  entry,
  onRemove,
  onStatusChange,
}: PosterCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowActions(false);
        setShowStatusMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={cardRef}
      className="poster-card relative group rounded-lg overflow-hidden bg-bg-card cursor-pointer"
      onClick={() => setShowActions(!showActions)}
    >
      {/* Poster Image */}
      <div className="aspect-[2/3] relative">
        {entry.poster_url ? (
          <Image
            src={entry.poster_url}
            alt={entry.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
          />
        ) : (
          <div className="w-full h-full bg-bg-hover flex items-center justify-center">
            <span className="text-text-muted text-xs text-center px-2">
              {entry.title}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badge */}
        <div
          className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium status-${entry.status}`}
        >
          {STATUS_LABELS[entry.status]}
        </div>

        {/* Category badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/50 text-text-secondary capitalize">
          {entry.category}
        </div>

        {/* Title on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-sm font-medium text-white leading-tight line-clamp-2">
            {entry.title}
          </p>
        </div>
      </div>

      {/* Action overlay */}
      {showActions && (
        <div
          className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 animate-fade-in z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm font-medium text-white text-center px-3 line-clamp-2">
            {entry.title}
          </p>

          {/* Status changer */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium status-${entry.status} border border-white/10`}
            >
              {STATUS_LABELS[entry.status]}
              <ChevronDown size={12} />
            </button>
            {showStatusMenu && (
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-bg-secondary border border-border rounded-lg overflow-hidden shadow-xl z-20 min-w-[140px]">
                {(Object.entries(STATUS_LABELS) as [Status, string][]).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onStatusChange(entry.id, key);
                        setShowStatusMenu(false);
                        setShowActions(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-xs hover:bg-bg-hover transition-colors ${
                        entry.status === key
                          ? "text-accent font-medium"
                          : "text-text-secondary"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Remove button */}
          <button
            onClick={() => {
              onRemove(entry.id);
              setShowActions(false);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-danger/20 text-danger hover:bg-danger/30 transition-colors"
          >
            <Trash2 size={12} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
