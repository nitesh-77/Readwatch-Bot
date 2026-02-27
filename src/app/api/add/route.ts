import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { searchMedia } from "@/lib/api-helpers";
import { Category, Status } from "@/lib/types";

const VALID_CATEGORIES: Category[] = ["movie", "show", "anime", "manga"];
const VALID_STATUSES: Status[] = [
  "plan_to_watch",
  "watching",
  "completed",
  "dropped",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      category,
      status = "plan_to_watch",
      external_id,
      poster_url,
      notes,
    } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: "title and category are required" },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    let finalExternalId = external_id;
    let finalPosterUrl = poster_url;

    // If no external_id provided, search for the title
    if (!finalExternalId) {
      const results = await searchMedia(title, category);
      if (results.length === 0) {
        return NextResponse.json(
          { error: `No results found for "${title}" in ${category}` },
          { status: 404 }
        );
      }
      const best = results[0];
      finalExternalId = best.external_id;
      finalPosterUrl = finalPosterUrl || best.poster_url;
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("watchlist")
      .upsert(
        {
          title,
          category,
          status,
          poster_url: finalPosterUrl,
          external_id: finalExternalId,
          notes: notes || null,
        },
        { onConflict: "external_id,category" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: data });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
