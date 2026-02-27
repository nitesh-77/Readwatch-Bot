import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, category } = body;
    const supabase = getSupabase();

    // Remove by id directly
    if (id) {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, removed: id });
    }

    // Remove by title + category
    if (title && category) {
      const { data, error } = await supabase
        .from("watchlist")
        .delete()
        .ilike("title", `%${title}%`)
        .eq("category", category)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: `No entry found matching "${title}" in ${category}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        removed: data.map((d) => d.title),
      });
    }

    return NextResponse.json(
      { error: "Provide either 'id' or both 'title' and 'category'" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
