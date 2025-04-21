import { db } from "@/drizzle/db";
import { constraints } from "@/drizzle/schema";
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

    // Create the constraint
    const [constraint] = await db
      .insert(constraints)
      .values({
        problemId,
        content,
        order: order || 0,
      })
      .returning();

    return NextResponse.json(constraint);
  } catch (error) {
    console.error("Error creating constraint:", error);
    return NextResponse.json(
      { error: "Failed to create constraint" },
      { status: 500 }
    );
  }
}
