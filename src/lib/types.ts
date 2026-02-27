export type Category = "movie" | "show" | "anime" | "manga";

export type Status =
  | "plan_to_watch"
  | "watching"
  | "completed"
  | "dropped";

export const STATUS_LABELS: Record<Status, string> = {
  plan_to_watch: "Plan to Watch",
  watching: "Watching",
  completed: "Completed",
  dropped: "Dropped",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  movie: "Movies",
  show: "Shows",
  anime: "Anime",
  manga: "Manga",
};

export interface WatchlistEntry {
  id: string;
  title: string;
  category: Category;
  status: Status;
  poster_url: string | null;
  external_id: string;
  date_added: string;
  notes: string | null;
}

export interface SearchResult {
  external_id: string;
  title: string;
  poster_url: string | null;
  year: string | null;
  overview: string | null;
  category: Category;
}
