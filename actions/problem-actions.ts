"use server";

import { db } from "@/drizzle/db";
import {
  problems,
  examples,
  constraints,
  hints,
  starterCode,
  testCases,
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Function to get problem details by ID
export async function getProblemDetails(problemId: string) {
  try {
    const problemData = await db
      .select()
      .from(problems)
      .where(eq(problems.id, problemId))
      .limit(1);

    if (!problemData || problemData.length === 0) {
      return null;
    }

    return problemData[0];
  } catch (error) {
    console.error("Error fetching problem details:", error);
    throw new Error("Failed to fetch problem details");
  }
}

// Update problem details
export async function updateProblemDetails(
  problemId: string,
  data: {
    title: string;
    description: string;
    difficulty: string;
    timeLimit: string;
    memoryLimit: string;
  }
) {
  try {
    await db
      .update(problems)
      .set({
        title: data.title,
        description: data.description,
        difficulty: data.difficulty.toLowerCase() as "easy" | "medium" | "hard",
        timeLimit: data.timeLimit || "1 second",
        memoryLimit: data.memoryLimit || "256 megabytes",
        updatedAt: new Date(),
      })
      .where(eq(problems.id, problemId));

    revalidatePath(`/problems/${problemId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating problem details:", error);
    return { success: false, error: "Failed to update problem details" };
  }
}

// Update examples
export async function updateProblemExamples(
  problemId: string,
  examplesData: {
    input: string;
    output: string;
    explanation?: string | null;
  }[]
) {
  try {
    // Delete existing examples
    await db.delete(examples).where(eq(examples.problemId, problemId));

    // Insert new examples
    const validExamples = examplesData.filter(
      (ex) => ex.input.trim() !== "" && ex.output.trim() !== ""
    );

    if (validExamples.length > 0) {
      const examplePromises = validExamples.map((example, index) => {
        return db.insert(examples).values({
          problemId,
          input: example.input,
          output: example.output,
          explanation: example.explanation || null,
          order: index,
        });
      });

      await Promise.all(examplePromises);
    }

    revalidatePath(`/problems/${problemId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating examples:", error);
    return { success: false, error: "Failed to update examples" };
  }
}

// Update starter code
export async function updateProblemStarterCode(
  problemId: string,
  starterCodeData: {
    language: string;
    code: string;
  }[]
) {
  try {
    // Delete existing starter code
    await db.delete(starterCode).where(eq(starterCode.problemId, problemId));

    // Insert new starter code
    const validStarterCode = starterCodeData.filter(
      (sc) => sc.code.trim() !== ""
    );

    if (validStarterCode.length > 0) {
      const starterCodePromises = validStarterCode.map((code) => {
        // Validate that language is one of the allowed values
        const language = ["cpp", "java", "python"].includes(code.language)
          ? (code.language as "cpp" | "java" | "python")
          : "python"; // Default fallback

        return db.insert(starterCode).values({
          problemId,
          language,
          code: code.code,
        });
      });

      await Promise.all(starterCodePromises);
    }

    revalidatePath(`/problems/${problemId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating starter code:", error);
    return { success: false, error: "Failed to update starter code" };
  }
}

// Update test cases
export async function updateProblemTestCases(
  problemId: string,
  testCasesData: {
    inputLines: string[];
    expectedOutput: string;
    isHidden: boolean;
    order: number;
  }[]
) {
  try {
    // Delete existing test cases
    await db.delete(testCases).where(eq(testCases.problemId, problemId));

    // Insert new test cases
    const validTestCases = testCasesData.filter(
      (tc) => tc.expectedOutput.trim() !== ""
    );

    if (validTestCases.length > 0) {
      const testCasePromises = validTestCases.map((testCase) => {
        return db.insert(testCases).values({
          problemId,
          inputLines: testCase.inputLines,
          expectedOutput: testCase.expectedOutput,
          isHidden: testCase.isHidden,
          order: testCase.order,
        });
      });

      await Promise.all(testCasePromises);
    }

    revalidatePath(`/problems/${problemId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating test cases:", error);
    return { success: false, error: "Failed to update test cases" };
  }
}

// Update constraints
export async function updateProblemConstraints(
  problemId: string,
  constraintsData: {
    content: string;
    order: number;
  }[]
) {
  try {
    // Delete existing constraints
    await db.delete(constraints).where(eq(constraints.problemId, problemId));

    // Insert new constraints
    const validConstraints = constraintsData.filter(
      (c) => c.content.trim() !== ""
    );

    if (validConstraints.length > 0) {
      const constraintPromises = validConstraints.map((constraint) => {
        return db.insert(constraints).values({
          problemId,
          content: constraint.content,
          order: constraint.order,
        });
      });

      await Promise.all(constraintPromises);
    }

    revalidatePath(`/problems/${problemId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating constraints:", error);
    return { success: false, error: "Failed to update constraints" };
  }
}

// Update hints
export async function updateProblemHints(
  problemId: string,
  hintsData: {
    content: string;
    order: number;
  }[]
) {
  try {
    // Delete existing hints
    await db.delete(hints).where(eq(hints.problemId, problemId));

    // Insert new hints
    const validHints = hintsData.filter((h) => h.content.trim() !== "");

    if (validHints.length > 0) {
      const hintPromises = validHints.map((hint) => {
        return db.insert(hints).values({
          problemId,
          content: hint.content,
          order: hint.order,
        });
      });

      await Promise.all(hintPromises);
    }

    revalidatePath(`/problems/${problemId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating hints:", error);
    return { success: false, error: "Failed to update hints" };
  }
}
