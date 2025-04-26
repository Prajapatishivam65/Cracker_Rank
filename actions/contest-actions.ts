"use server";

import { db } from "@/drizzle/db";
import {
  Contest,
  contestParticipants,
  contests,
  Problem,
  problems,
  UserTable,
} from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Fetches a single contest by ID
 * @param contestId The ID of the contest to fetch
 * @returns The contest object or null if not found
 */
export async function getContestById(
  contestId: string
): Promise<Contest | null> {
  try {
    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId))
      .limit(1);

    return contest || null;
  } catch (error) {
    console.error("Error fetching contest:", error);
    throw new Error("Failed to fetch contest");
  }
}

/**
 * Fetches all problems for a specific contest
 * @param contestId The ID of the contest
 * @returns Array of problem objects
 */
export async function getContestProblems(
  contestId: string
): Promise<Problem[]> {
  try {
    const problemsList = await db
      .select()
      .from(problems)
      .where(eq(problems.contestId, contestId))
      .orderBy(problems.order);

    return problemsList;
  } catch (error) {
    console.error("Error fetching problems:", error);
    throw new Error("Failed to fetch problems");
  }
}

/**
 * Checks if a user is registered for a contest
 * @param contestId The contest ID
 * @param userId The user ID
 * @returns Boolean indicating if user is registered
 */
export async function isUserRegisteredForContest(
  contestId: string,
  userId: string
): Promise<boolean> {
  try {
    const [registration] = await db
      .select()
      .from(contestParticipants)
      .where(
        and(
          eq(contestParticipants.contestId, contestId),
          eq(contestParticipants.userId, userId)
        )
      )
      .limit(1);

    return !!registration;
  } catch (error) {
    console.error("Error checking registration:", error);
    return false;
  }
}

/**
 * Gets a user's current score in a contest
 * @param contestId The contest ID
 * @param userId The user ID
 * @returns User's current score or null if not participating
 */
export async function getUserContestScore(
  contestId: string,
  userId: string
): Promise<number | null> {
  try {
    const [participation] = await db
      .select()
      .from(contestParticipants)
      .where(
        and(
          eq(contestParticipants.contestId, contestId),
          eq(contestParticipants.userId, userId)
        )
      )
      .limit(1);

    return participation ? participation.score : null;
  } catch (error) {
    console.error("Error fetching user contest score:", error);
    return null;
  }
}

/**
 * Gets contest status based on dates
 * @param contest The contest object with start and end dates
 * @returns The status of the contest (upcoming, active, ended)
 */
export async function getContestStatus(
  contest: Contest
): Promise<"upcoming" | "active" | "ended"> {
  const now = new Date();
  const startDate = new Date(contest.startDate);
  const endDate = new Date(contest.endDate);

  if (now < startDate) return "upcoming";
  if (now > endDate) return "ended";
  return "active";
}

/**
 * Calculate time remaining for a contest
 * @param contest The contest object
 * @returns Formatted string with time remaining or status message
 */
export async function getTimeRemaining(contest: Contest): Promise<string> {
  const now = new Date();
  const end = new Date(contest.endDate);

  if (now > end) return "Contest ended";

  const totalMs = end.getTime() - now.getTime();
  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m remaining`;
}

/**
 * Calculate contest progress percentage
 * @param contest The contest object
 * @returns Progress percentage (0-100)
 */
export async function getContestProgress(contest: Contest): Promise<number> {
  const start = new Date(contest.startDate).getTime();
  const end = new Date(contest.endDate).getTime();
  const now = new Date().getTime();

  if (now <= start) return 0;
  if (now >= end) return 100;

  return Math.floor(((now - start) / (end - start)) * 100);
}

/**
 * Fetches contest leaderboard
 * @param contestId The ID of the contest
 * @returns Array of participants with user details and scores
 */
export async function getContestLeaderboard(contestId: string) {
  try {
    const leaderboard = await db
      .select({
        userId: contestParticipants.userId,
        name: UserTable.name,
        score: contestParticipants.score,
        rank: contestParticipants.rank,
        joinedAt: contestParticipants.joinedAt,
      })
      .from(contestParticipants)
      .innerJoin(UserTable, eq(contestParticipants.userId, UserTable.id))
      .where(eq(contestParticipants.contestId, contestId))
      .orderBy(contestParticipants.score, contestParticipants.joinedAt);

    return leaderboard;
  } catch (error) {
    console.error("Error fetching contest leaderboard:", error);
    throw new Error("Failed to fetch leaderboard");
  }
}
