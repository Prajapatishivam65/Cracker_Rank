import { db } from "@/drizzle/db";
import { examples } from "@/drizzle/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { problemId, input, output, explanation, order } = body;

    // Validate required fields
    if (!problemId || !input || !output) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the example
    const [example] = await db
      .insert(examples)
      .values({
        problemId,
        input,
        output,
        explanation,
        order: order || 0,
      })
      .returning();

    return NextResponse.json(example);
  } catch (error) {
    console.error("Error creating example:", error);
    return NextResponse.json(
      { error: "Failed to create example" },
      { status: 500 }
    );
  }
}
