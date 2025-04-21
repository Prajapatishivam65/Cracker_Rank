import { db } from "@/drizzle/db";
import { testCases } from "@/drizzle/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { problemId, inputLines, expectedOutput, isHidden, order } = body;

    // Validate required fields
    if (!problemId || !inputLines || !expectedOutput) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the test case
    const [testCase] = await db
      .insert(testCases)
      .values({
        problemId,
        inputLines,
        expectedOutput,
        isHidden: isHidden || false,
        order: order || 0,
      })
      .returning();

    return NextResponse.json(testCase);
  } catch (error) {
    console.error("Error creating test case:", error);
    return NextResponse.json(
      { error: "Failed to create test case" },
      { status: 500 }
    );
  }
}
