"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Plus, Loader2 } from "lucide-react";
import {
  Category,
  CATEGORY_LABELS,
  SearchResult,
  Status,
  STATUS_LABELS,
} from "@/lib/types";
import Image from "next/image";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (result: SearchResult, status: Status) => void;
}

export default function SearchModal({ isOpen, onClose, onAdd }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("movie");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>("plan_to_watch");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&category=${category}`
        );
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, category]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop bg-black/60 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-bg-secondary w-full max-w-lg max-h-[85dvh] rounded-t-2xl sm:rounded-2xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Add Media</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-bg-hover transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Category selector */}
        <div className="flex gap-2 px-4 pt-4">
          {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  category === key
                    ? "bg-accent text-white"
                    : "bg-bg-card text-text-secondary hover:bg-bg-hover"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {/* Search input */}
        <div className="p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${CATEGORY_LABELS[category].toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:border-accent/50 transition-colors"
            />
            {loading && (
              <Loader2
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-accent animate-spin"
              />
            )}
          </div>
        </div>

        {/* Status selector */}
        <div className="flex gap-2 px-4 pb-3">
          <span className="text-xs text-text-muted self-center mr-1">
            Add as:
          </span>
          {(Object.entries(STATUS_LABELS) as [Status, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                  selectedStatus === key
                    ? `status-${key} border border-white/10`
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {results.length === 0 && query.length >= 2 && !loading && (
            <p className="text-center text-text-muted text-sm py-8">
              No results found
            </p>
          )}
          {results.map((result) => (
            <div
              key={`${result.category}-${result.external_id}`}
              className="flex gap-3 p-3 rounded-xl bg-bg-card hover:bg-bg-hover transition-colors group"
            >
              {/* Poster thumbnail */}
              <div className="w-12 h-18 rounded-md overflow-hidden flex-shrink-0 bg-bg-hover">
                {result.poster_url ? (
                  <Image
                    src={result.poster_url}
                    alt={result.title}
                    width={48}
                    height={72}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-text-muted text-[8px]">N/A</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {result.title}
                </p>
                {result.year && (
                  <p className="text-xs text-text-muted mt-0.5">
                    {result.year}
                  </p>
                )}
                {result.overview && (
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">
                    {result.overview}
                  </p>
                )}
              </div>

              {/* Add button */}
              <button
                onClick={() => onAdd(result, selectedStatus)}
                className="self-center p-2 rounded-full bg-accent/20 text-accent hover:bg-accent hover:text-white transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
