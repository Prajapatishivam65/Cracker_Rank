import { db } from "@/drizzle/db";
import { problems } from "@/drizzle/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      contestId,
      title,
      description,
      difficulty,
      timeLimit,
      memoryLimit,
      order,
      createdBy,
    } = body;

    // Verify the createdBy matches the session user ID for security

    if (!contestId || !title || !description || !createdBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Inserting the problem", contestId);

    const [problem] = await db
      .insert(problems)
      .values({
        contestId,
        title,
        description,
        difficulty,
        timeLimit,
        memoryLimit,
        order,
        createdBy,
      })
      .returning();

    console.log("Problem created:", problem);

    return NextResponse.json(problem);
  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json(
      { error: "Failed to create problem" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get("contestId");

    if (contestId) {
      const problemsList = await db.query.problems.findMany({
        where: (problems, { eq }) => eq(problems.contestId, contestId),
        orderBy: (problems, { asc }) => [asc(problems.order)],
      });
      return NextResponse.json(problemsList);
    }

    const allProblems = await db.query.problems.findMany();
    return NextResponse.json(allProblems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}
