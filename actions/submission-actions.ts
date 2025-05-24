"use server";

import { db } from "@/drizzle/db";
import { submissions } from "@/drizzle/schema";

import { eq } from "drizzle-orm";
import { executeCode } from "@/lib/code-execution";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/auth/currentUser";

export interface SubmissionResult {
  id: string;
  status:
    | "pending"
    | "accepted"
    | "wrong_answer"
    | "time_limit_exceeded"
    | "compilation_error"
    | "partial_accepted"
    | "runtime_error";
  executionTime?: number;
  memoryUsed?: number;
  errorMessage?: string;
}

export async function createSubmission(
  problemId: string,
  code: string,
  language: "cpp" | "java" | "python"
): Promise<SubmissionResult> {
  try {
    // Get current user
    const user = await getCurrentUser({ redirectIfNotFound: true });

    // Create initial submission record
    const [submission] = await db
      .insert(submissions)
      .values({
        problemId,
        userId: user.id,
        language,
        code,
        status: "pending",
      })
      .returning();

    // Return the submission with pending status
    return {
      id: submission.id,
      status: "pending",
    };
  } catch (error) {
    console.error("Error creating submission:", error);
    throw new Error("Failed to create submission");
  }
}

export async function executeSubmission(
  submissionId: string,
  testCases: Array<{ input: string[]; expectedOutput: string }>
): Promise<SubmissionResult> {
  try {
    // Get the submission
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
      with: {
        problem: true,
        user: true,
      },
    });

    if (!submission) {
      throw new Error("Submission not found");
    }

    // Execute the code against test cases
    const executionResults = await executeCode(
      submission.code,
      submission.language,
      testCases
    );

    // Determine overall status
    let status:
      | "pending"
      | "accepted"
      | "wrong_answer"
      | "time_limit_exceeded"
      | "runtime_error" = "accepted"; // Default to accepted if all tests pass
    let errorMessage: string | null = null;
    let totalExecutionTime = 0;
    let maxMemoryUsed = 0;

    for (const result of executionResults) {
      if (!result.passed) {
        if (
          result.error?.includes("timeout") ||
          result.error?.includes("time limit")
        ) {
          status = "time_limit_exceeded";
          errorMessage = "Time limit exceeded";
          break;
        } else if (result.error) {
          status = "runtime_error";
          errorMessage = result.error;
          break;
        } else {
          status = "wrong_answer";
          errorMessage = `Wrong answer on test case ${result.testCaseIndex + 1}`;
          break;
        }
      }

      // Accumulate execution metrics (mock values for now)
      totalExecutionTime += Math.random() * 100; // Mock execution time
      maxMemoryUsed = Math.max(maxMemoryUsed, Math.random() * 1024); // Mock memory usage
    }

    // Update submission with results
    const [updatedSubmission] = await db
      .update(submissions)
      .set({
        status,
        executionTime: Math.round(totalExecutionTime),
        memoryUsed: Math.round(maxMemoryUsed),
        errorMessage,
      })
      .where(eq(submissions.id, submissionId))
      .returning();

    // Revalidate any pages that might show this submission
    revalidatePath(`/problems/${submission.problemId}`);
    revalidatePath(`/submissions`);

    return {
      id: updatedSubmission.id,
      status: updatedSubmission.status,
      executionTime: updatedSubmission.executionTime || undefined,
      memoryUsed: updatedSubmission.memoryUsed || undefined,
      errorMessage: updatedSubmission.errorMessage || undefined,
    };
  } catch (error) {
    console.error("Error executing submission:", error);

    // Update submission with error status
    await db
      .update(submissions)
      .set({
        status: "runtime_error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(submissions.id, submissionId));

    throw new Error("Failed to execute submission");
  }
}

export async function getSubmissionHistory(problemId: string, limit = 10) {
  try {
    const user = await getCurrentUser({ redirectIfNotFound: true });

    const userSubmissions = await db.query.submissions.findMany({
      where:
        eq(submissions.problemId, problemId) && eq(submissions.userId, user.id),
      orderBy: (submissions, { desc }) => [desc(submissions.createdAt)],
      limit,
      columns: {
        id: true,
        language: true,
        status: true,
        executionTime: true,
        memoryUsed: true,
        createdAt: true,
        errorMessage: true,
      },
    });

    return userSubmissions;
  } catch (error) {
    console.error("Error fetching submission history:", error);
    return [];
  }
}

export async function getSubmissionDetails(submissionId: string) {
  try {
    const user = await getCurrentUser({ redirectIfNotFound: true });

    const submission = await db.query.submissions.findFirst({
      where:
        eq(submissions.id, submissionId) && eq(submissions.userId, user.id),
      with: {
        problem: {
          columns: {
            title: true,
            difficulty: true,
          },
        },
      },
    });

    return submission;
  } catch (error) {
    console.error("Error fetching submission details:", error);
    return null;
  }
}
