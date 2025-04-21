import type { Problem } from "@/hooks/use-problem-form";

export async function createProblem(contestId: string, problem: Problem) {
  console.log("Preparing to submit problem:", {
    title: problem.title,
    description: `${problem.description.substring(0, 50)}...`,
    difficulty: problem.difficulty,
    contestId,
    examples: problem.examples.length,
    testCases: problem.testCases.length + problem.hiddenTestCases.length,
  });

  try {
    // Step 1: Create the main problem record
    console.log("STEP 1: Creating main problem record");
    const problemResponse = await fetch("/api/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contestId,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty.toLowerCase(), // Convert to match enum lowercase values
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
        order: 0, // Default order or you could fetch the count of existing problems
      }),
    });

    if (!problemResponse.ok) {
      throw new Error(
        `Failed to create problem: ${problemResponse.statusText}`
      );
    }

    const problemData = await problemResponse.json();
    const problemId = problemData.id;
    console.log(`✅ Created problem with ID: ${problemId}`);

    // Step 2: Save constraints
    console.log("STEP 2: Saving constraints");
    const constraintPromises = problem.constraints
      .filter((constraint) => constraint.trim() !== "")
      .map(async (constraint, index) => {
        return fetch("/api/constraints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId,
            content: constraint,
            order: index,
          }),
        });
      });

    await Promise.all(constraintPromises);
    console.log(`✅ Saved ${constraintPromises.length} constraints`);

    // Step 3: Save hints
    console.log("STEP 3: Saving hints");
    const hintPromises = problem.hints
      .filter((hint) => hint.trim() !== "")
      .map(async (hint, index) => {
        return fetch("/api/hints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId,
            content: hint,
            order: index,
          }),
        });
      });

    await Promise.all(hintPromises);
    console.log(`✅ Saved ${hintPromises.length} hints`);

    // Step 4: Save examples
    console.log("STEP 4: Saving examples");
    const examplePromises = problem.examples
      .filter(
        (example) => example.input.trim() !== "" && example.output.trim() !== ""
      )
      .map(async (example, index) => {
        return fetch("/api/examples", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId,
            input: example.input,
            output: example.output,
            explanation: example.explanation || null,
            order: index,
          }),
        });
      });

    await Promise.all(examplePromises);
    console.log(`✅ Saved ${examplePromises.length} examples`);

    // Step 5: Save starter code for each language
    console.log("STEP 5: Saving starter code templates");
    const starterCodePromises = Object.entries(problem.starterCode)
      .filter(([_, code]) => code.trim() !== "")
      .map(async ([language, code]) => {
        return fetch("/api/starter-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId,
            language, // language is already lowercase (cpp, java, python)
            code,
          }),
        });
      });

    await Promise.all(starterCodePromises);
    console.log(
      `✅ Saved starter code for ${starterCodePromises.length} languages`
    );

    // Step 6: Save visible test cases
    console.log("STEP 6: Saving visible test cases");
    const testCasePromises = problem.testCases
      .filter((tc) => tc.expectedOutput.trim() !== "")
      .map(async (testCase, index) => {
        // Filter out empty input lines
        const filteredInput = testCase.input.filter(
          (line) => line.trim() !== ""
        );

        return fetch("/api/test-cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId,
            inputLines: filteredInput.length > 0 ? filteredInput : [""], // Ensure at least one input line
            expectedOutput: testCase.expectedOutput,
            isHidden: false,
            order: index,
          }),
        });
      });

    await Promise.all(testCasePromises);
    console.log(`✅ Saved ${testCasePromises.length} visible test cases`);

    // Step 7: Save hidden test cases
    console.log("STEP 7: Saving hidden test cases");
    const hiddenTestCasePromises = problem.hiddenTestCases
      .filter((tc) => tc.expectedOutput.trim() !== "")
      .map(async (testCase, index) => {
        // Filter out empty input lines
        const filteredInput = testCase.input.filter(
          (line) => line.trim() !== ""
        );

        return fetch("/api/test-cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId,
            inputLines: filteredInput.length > 0 ? filteredInput : [""], // Ensure at least one input line
            expectedOutput: testCase.expectedOutput,
            isHidden: true,
            order: index,
          }),
        });
      });

    await Promise.all(hiddenTestCasePromises);
    console.log(`✅ Saved ${hiddenTestCasePromises.length} hidden test cases`);

    console.log("✅ PROBLEM CREATION COMPLETE");

    return problemData;
  } catch (error) {
    console.error("Error creating problem:", error);
    throw error;
  }
}
