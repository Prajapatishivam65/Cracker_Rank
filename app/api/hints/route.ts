import { db } from "@/drizzle/db";
import { hints } from "@/drizzle/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { problemId, content, order } = body;

    // Validate required fields
    if (!problemId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the hint
    const [hint] = await db
      .insert(hints)
      .values({
        problemId,
        content,
        order: order || 0,
      })
      .returning();

    return NextResponse.json(hint);
  } catch (error) {
    console.error("Error creating hint:", error);
    return NextResponse.json(
      { error: "Failed to create hint" },
      { status: 500 }
    );
  }
}
