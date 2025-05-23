import { getCurrentUser } from "@/auth/currentUser";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import ProblemAdminView from "@/components/problems/problem-view";
import {
  problems,
  constraints,
  hints,
  examples,
  starterCode,
  UserTable,
  contests,
  testCases, // Add this if you have test cases table
} from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import CodeEditorPlatform from "@/components/codeEditor/code-editor-platform";
import ProblemDetails from "@/components/codeEditor/problemdetails";

interface PageProps {
  params: {
    problemId: string;
  };
}

// Define the Problem type to match your sample structure
interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: string;
  memoryLimit: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  hints: string[];
  starterCode: {
    cpp: string;
    java: string;
    python: string;
  };
  testCases?: Array<{
    input: string[];
    expectedOutput: string;
  }>;
  hiddenTestCases?: Array<{
    input: string[];
    expectedOutput: string;
  }>;
}

export default async function ProblemAdminPage({ params }: PageProps) {
  const { problemId } = await params;

  // Get current user server-side
  const user = await getCurrentUser({ withFullUser: true });

  // If no user is found, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Fetch the problem with complete relations
  const problem = await db.query.problems.findFirst({
    where: eq(problems.id, problemId),
    with: {
      creator: true,
      contest: true,
    },
  });

  if (!problem) {
    redirect("/not-found");
  }

  // Fetch all related data for the problem
  const problemConstraints = await db.query.constraints.findMany({
    where: eq(constraints.problemId, problemId),
    orderBy: constraints.order,
  });

  const problemHints = await db.query.hints.findMany({
    where: eq(hints.problemId, problemId),
    orderBy: hints.order,
  });

  const problemExamples = await db.query.examples.findMany({
    where: eq(examples.problemId, problemId),
    orderBy: examples.order,
  });

  // Get all starter code options for this problem
  const problemStarterCode = await db.query.starterCode.findMany({
    where: eq(starterCode.problemId, problemId),
  });

  const problemTestCases = await db.query.testCases.findMany({
    where: eq(testCases.problemId, problemId),
    orderBy: testCases.order, // Orders test cases based on the 'order' field
  });
  // Fetch test cases if you have them in your database
  // const problemTestCases = await db.query.testCases.findMany({
  //   where: eq(testCases.problemId, problemId),
  // });

  // Format data to match the sampleProblem structure
  const formattedProblem: Problem = {
    id: problem.id,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    timeLimit: problem.timeLimit?.toString() || "1 second",
    memoryLimit: problem.memoryLimit?.toString() || "256 megabytes",
    constraints: problemConstraints.map((c) => c.content),
    hints: problemHints.map((h) => h.content),
    examples: problemExamples.map((example) => ({
      input: example.input,
      output: example.output,
      explanation: example.explanation || undefined,
    })),
    starterCode: {
      cpp:
        problemStarterCode.find((code) => code.language === "cpp")?.code ||
        "// C++ code here\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your solution here\n    return 0;\n}",
      java:
        problemStarterCode.find((code) => code.language === "java")?.code ||
        "// Java code here\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your solution here\n    }\n}",
      python:
        problemStarterCode.find((code) => code.language === "python")?.code ||
        "# Python code here\n# Your solution here",
    },
    testCases: problemTestCases
      .filter((tc) => !tc.isHidden)
      .map((tc) => ({
        input: tc.inputLines,
        expectedOutput: tc.expectedOutput,
      })),
    hiddenTestCases: problemTestCases
      .filter((tc) => tc.isHidden)
      .map((tc) => ({
        input: tc.inputLines,
        expectedOutput: tc.expectedOutput,
      })),
  };

  // Log the formatted problem data
  console.log("=== FORMATTED PROBLEM DATA ===");
  console.log(JSON.stringify(formattedProblem, null, 2));
  console.log("=== END FORMATTED PROBLEM DATA ===");

  // Create the problem data object for the admin view (keeping your original structure)
  const problemData = {
    id: problem.id,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    timeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit,
    constraints: problemConstraints.map((c) => c.content),
    examples: problemExamples.map((example) => ({
      input: example.input,
      output: example.output,
      explanation: example.explanation || undefined,
    })),
    hints: problemHints.map((h) => h.content),
    starterCode: {
      cpp:
        problemStarterCode.find((code) => code.language === "cpp")?.code ||
        "// C++ code here",
      java:
        problemStarterCode.find((code) => code.language === "java")?.code ||
        "// Java code here",
      python:
        problemStarterCode.find((code) => code.language === "python")?.code ||
        "# Python code here",
    },
    testCases: problemTestCases
      .filter((tc) => !tc.isHidden)
      .map((tc) => ({
        input: tc.inputLines,
        expectedOutput: tc.expectedOutput,
      })),
    hiddenTestCases: problemTestCases
      .filter((tc) => tc.isHidden)
      .map((tc) => ({
        input: tc.inputLines,
        expectedOutput: tc.expectedOutput,
      })),
  };

  return (
    <div className="">
      <CodeEditorPlatform />
    </div>
  );
}
