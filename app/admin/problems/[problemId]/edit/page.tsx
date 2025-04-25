import { getCurrentUser } from "@/auth/currentUser";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import EditProblemForm from "@/components/problems/edit-problem-form";
import {
  problems,
  constraints,
  hints,
  examples,
  starterCode,
  testCases,
} from "@/drizzle/schema";
import { db } from "@/drizzle/db";

interface PageProps {
  params: {
    problemId: string;
  };
}

export default async function EditProblemPage({ params }: PageProps) {
  const problemId = params.problemId;

  // Get current user server-side
  const user = await getCurrentUser({ withFullUser: true });

  // If no user is found, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Check if user is admin, if not redirect
  if (user.role !== "admin") {
    redirect("/unauthorized");
  }

  // Fetch the problem with complete relations
  const problem = await db.query.problems.findFirst({
    where: eq(problems.id, problemId),
    with: {
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

  // Get all test cases for this problem
  const problemTestCases = await db.query.testCases.findMany({
    where: eq(testCases.problemId, problemId),
    orderBy: testCases.order,
  });

  // Format data for the form
  const formattedStarterCode = {
    cpp: problemStarterCode.find((code) => code.language === "cpp")?.code || "",
    java:
      problemStarterCode.find((code) => code.language === "java")?.code || "",
    python:
      problemStarterCode.find((code) => code.language === "python")?.code || "",
  };

  // Format examples
  const formattedExamples = problemExamples.map((example) => ({
    input: example.input,
    output: example.output,
    explanation: example.explanation || "",
  }));

  // Format test cases
  const visibleTestCases = problemTestCases
    .filter((tc) => !tc.isHidden)
    .map((tc) => ({
      input: tc.inputLines as string[],
      expectedOutput: tc.expectedOutput,
    }));

  const hiddenTestCases = problemTestCases
    .filter((tc) => tc.isHidden)
    .map((tc) => ({
      input: tc.inputLines as string[],
      expectedOutput: tc.expectedOutput,
    }));

  // Create the problem data object to pass to client component
  const problemData = {
    id: problem.id,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    timeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit,
    constraints: problemConstraints.map((c) => c.content),
    hints: problemHints.map((h) => h.content),
    examples: formattedExamples,
    testCases: visibleTestCases,
    hiddenTestCases: hiddenTestCases,
    starterCode: formattedStarterCode,
    contestId: problem.contestId,
    createdBy: problem.createdBy,
    order: problem.order,
  };

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Problem</h1>
      <EditProblemForm problem={problemData} userId={user.id} />
    </div>
  );
}
