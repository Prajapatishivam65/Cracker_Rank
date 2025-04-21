import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { starterCode } from "@/drizzle/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { problemId, language, code } = body;

    // Validate required fields
    if (!problemId || !language || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the starter code
    const [starter] = await db
      .insert(starterCode)
      .values({
        problemId,
        language: language as any,
        code,
      })
      .returning();

    return NextResponse.json(starter);
  } catch (error) {
    console.error("Error creating starter code:", error);
    return NextResponse.json(
      { error: "Failed to create starter code" },
      { status: 500 }
    );
  }
}
