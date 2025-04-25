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
} from "@/drizzle/schema";
import { db } from "@/drizzle/db";

interface PageProps {
  params: {
    problemId: string;
  };
}

export default async function ProblemAdminPage({ params }: PageProps) {
  const { problemId } = await params; // Get the problem ID from the URL
  // const problemId = "d8674c0b-3e98-46c5-bd85-ef5e5ae3e45a"; // params.id;
  // ** remove this line when using dynamic routing

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
      creator: true,
      contest: true,
    },
  });

  if (!problem) {
    redirect("/not-found");
  }

  // Fetch all related data for the
  // problem
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

  // Format data for the view
  const formattedStarterCode = {
    cpp:
      problemStarterCode.find((code) => code.language === "cpp")?.code ||
      "// C++ code here",
    java:
      problemStarterCode.find((code) => code.language === "java")?.code ||
      "// Java code here",
    python:
      problemStarterCode.find((code) => code.language === "python")?.code ||
      "# Python code here",
  };

  // Format examples
  const formattedExamples = problemExamples.map((example) => ({
    input: example.input,
    output: example.output,
    explanation: example.explanation || undefined,
  }));

  // We'll use dummy submissions data for now
  // Later you can populate this from your database
  const dummySubmissions: never[] = [];

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
    starterCode: formattedStarterCode,
    contestId: problem.contestId,
    createdBy: problem.createdBy,
    creatorName: problem.creator.name,
    contestTitle: problem.contest.title,
    submissions: dummySubmissions,
    order: problem.order,
  };

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <ProblemAdminView problem={problemData} userId={user.id} />
    </div>
  );
}
