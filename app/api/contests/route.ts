import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { contests } from "@/drizzle/schema";

export async function GET() {
  try {
    // Fetch all contests from the database
    const allContests = await db.query.contests.findMany({
      orderBy: (contests, { desc }) => [desc(contests.createdAt)],
    });
    console.log("Fetched contests:", allContests);

    return NextResponse.json(allContests);
  } catch (error) {
    console.error("Error fetching contests:", error);
    return NextResponse.json(
      { error: "Failed to fetch contests" },
      { status: 500 }
    );
  }
}
