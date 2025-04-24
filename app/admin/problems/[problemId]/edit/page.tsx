// import { getCurrentUser } from "@/auth/currentUser";
// import { redirect } from "next/navigation";
// import { db } from "@/db";
// import {
//   problems,
//   constraints,
//   hints,
//   examples,
//   starterCode,
//   testCases,
// } from "@/user-roles";
// import { eq } from "drizzle-orm";
// import EditProblemForm from "@/components/problems/edit-problem-form";

// export default async function EditProblemPage({
//   params,
// }: {
//   params: { id: string };
// }) {
//   const problemId = params.id;

//   // Get current user server-side
//   const user = await getCurrentUser({ withFullUser: true });

//   // If no user is found, redirect to login
//   if (!user) {
//     redirect("/login");
//   }

//   // Fetch the problem and associated data
//   const problem = await db.query.problems.findFirst({
//     where: eq(problems.id, problemId),
//   });

//   if (!problem) {
//     redirect("/not-found");
//   }

//   // Fetch contest ID for the problem
//   const contestId = problem.contestId;

//   // Fetch all related data for the problem
//   const problemConstraints = await db.query.constraints.findMany({
//     where: eq(constraints.problemId, problemId),
//     orderBy: constraints.order,
//   });

//   const problemHints = await db.query.hints.findMany({
//     where: eq(hints.problemId, problemId),
//     orderBy: hints.order,
//   });

//   const problemExamples = await db.query.examples.findMany({
//     where: eq(examples.problemId, problemId),
//     orderBy: examples.order,
//   });

//   const problemStarterCode = await db.query.starterCode.findMany({
//     where: eq(starterCode.problemId, problemId),
//   });

//   const problemTestCases = await db.query.testCases.findMany({
//     where: eq(testCases.problemId, problemId),
//     orderBy: testCases.order,
//   });

//   // Check if user has permission to edit this problem
//   // Either the problem creator or an admin can edit
//   if (problem.createdBy !== user.id && user.role !== "admin") {
//     redirect("/unauthorized");
//   }

//   // Format data for the form
//   const formattedStarterCode = {
//     cpp: problemStarterCode.find((code) => code.language === "cpp")?.code || "",
//     java:
//       problemStarterCode.find((code) => code.language === "java")?.code || "",
//     python:
//       problemStarterCode.find((code) => code.language === "python")?.code || "",
//   };

//   const formattedExamples = problemExamples.map((example) => ({
//     input: example.input,
//     output: example.output,
//     explanation: example.explanation || "",
//   }));

//   const formattedTestCases = problemTestCases
//     .filter((testCase) => !testCase.isHidden)
//     .map((testCase) => ({
//       input: testCase.inputLines as string[],
//       expectedOutput: testCase.expectedOutput,
//     }));

//   const formattedHiddenTestCases = problemTestCases
//     .filter((testCase) => testCase.isHidden)
//     .map((testCase) => ({
//       input: testCase.inputLines as string[],
//       expectedOutput: testCase.expectedOutput,
//     }));

//   const formattedProblem = {
//     id: problem.id,
//     title: problem.title,
//     description: problem.description,
//     difficulty: problem.difficulty,
//     timeLimit: problem.timeLimit,
//     memoryLimit: problem.memoryLimit,
//     constraints: problemConstraints.map((c) => c.content),
//     hints: problemHints.map((h) => h.content),
//     examples: formattedExamples,
//     starterCode: formattedStarterCode,
//     testCases: formattedTestCases,
//     hiddenTestCases: formattedHiddenTestCases,
//   };

//   return (
//     <div className="mx-auto max-w-4xl">
//       <h1 className="mb-6 text-3xl font-bold">Edit Problem</h1>
//       <EditProblemForm
//         problem={formattedProblem}
//         contestId={contestId}
//         userId={user.id}
//       />
//     </div>
//   );
// }
