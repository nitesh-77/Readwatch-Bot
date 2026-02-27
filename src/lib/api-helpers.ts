import { SearchResult, Category } from "./types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const JIKAN_BASE = "https://api.jikan.moe/v4";

export async function searchTMDB(
  query: string,
  category: "movie" | "show"
): Promise<SearchResult[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY not configured");

  const endpoint = category === "movie" ? "movie" : "tv";
  const url = `${TMDB_BASE}/search/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);

  const data = await res.json();

  return data.results.slice(0, 10).map((item: Record<string, unknown>) => ({
    external_id: String(item.id),
    title: (category === "movie" ? item.title : item.name) as string,
    poster_url: item.poster_path
      ? `${TMDB_IMAGE_BASE}${item.poster_path}`
      : null,
    year: (
      (category === "movie" ? item.release_date : item.first_air_date) as string
    )?.slice(0, 4) || null,
    overview: (item.overview as string) || null,
    category,
  }));
}

export async function searchJikan(
  query: string,
  category: "anime" | "manga"
): Promise<SearchResult[]> {
  const url = `${JIKAN_BASE}/${category}?q=${encodeURIComponent(query)}&limit=10`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);

  const data = await res.json();

  return data.data.slice(0, 10).map((item: Record<string, unknown>) => {
    const images = item.images as Record<string, Record<string, string>>;
    return {
      external_id: String(item.mal_id),
      title:
        ((item.title_english as string) || (item.title as string)) ?? "Unknown",
      poster_url: images?.jpg?.large_image_url || images?.jpg?.image_url || null,
      year: item.year
        ? String(item.year)
        : ((item.aired as Record<string, unknown>)?.prop as Record<string, Record<string, number>>)?.from?.year
          ? String(((item.aired as Record<string, unknown>)?.prop as Record<string, Record<string, number>>)?.from?.year)
          : null,
      overview: (item.synopsis as string) || null,
      category,
    };
  });
}

export async function searchMedia(
  query: string,
  category: Category
): Promise<SearchResult[]> {
  switch (category) {
    case "movie":
    case "show":
      return searchTMDB(query, category);
    case "anime":
    case "manga":
      return searchJikan(query, category);
  }
}
