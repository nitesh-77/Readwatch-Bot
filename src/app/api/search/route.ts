import { NextRequest, NextResponse } from "next/server";
import { searchMedia } from "@/lib/api-helpers";
import { Category } from "@/lib/types";

const VALID_CATEGORIES: Category[] = ["movie", "show", "anime", "manga"];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category") as Category;

    if (!query || !category) {
      return NextResponse.json(
        { error: "Both 'q' and 'category' query params are required" },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const results = await searchMedia(query, category);

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
