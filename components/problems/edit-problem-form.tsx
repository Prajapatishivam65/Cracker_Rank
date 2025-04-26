"use client";

import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DetailsTab from "./edit/details-tab";
import ExamplesTab from "./edit/examples-tab";
import StarterCodeTab from "./edit/starter-code-tab";
import TestCasesTab from "./edit/test-cases-tab";
import HintsConstraintsTab from "./edit/hints-constraints-tab";
import { useProblemForm } from "@/hooks/edit-problem-form";

// Import server actions
import {
  updateProblemDetails,
  updateProblemExamples,
  updateProblemStarterCode,
  updateProblemTestCases,
  updateProblemConstraints,
  updateProblemHints,
} from "@/actions/problem-actions";

// Define the EditProblemFormProps interface
interface EditProblemFormProps {
  problem: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    timeLimit: string;
    memoryLimit: string;
    constraints: string[];
    hints: string[];
    examples: { input: string; output: string; explanation?: string }[];
    testCases: { input: string[]; expectedOutput: string }[];
    hiddenTestCases: { input: string[]; expectedOutput: string }[];
    starterCode: { cpp: string; java: string; python: string };
    contestId?: string;
  };
  userId: string;
}

// Memoize components to prevent unnecessary re-renders
const MemoizedDetailsTab = memo(DetailsTab);
const MemoizedExamplesTab = memo(ExamplesTab);
const MemoizedStarterCodeTab = memo(StarterCodeTab);
const MemoizedTestCasesTab = memo(TestCasesTab);
const MemoizedHintsConstraintsTab = memo(HintsConstraintsTab);

export default function EditProblemForm({
  problem,
  userId,
}: EditProblemFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<string>("details");

  // Added missing handleStepChange function
  const handleStepChange = (value: string) => {
    setStep(value);
  };

  // Initialize the form with existing problem data
  const { problem: formData, handlers } = useProblemForm({
    initialData: {
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      constraints: problem.constraints,
      hints: problem.hints,
      examples: problem.examples,
      testCases: problem.testCases,
      hiddenTestCases: problem.hiddenTestCases,
      starterCode: {
        cpp: problem.starterCode.cpp,
        java: problem.starterCode.java,
        python: problem.starterCode.python,
      },
    },
  });

  const onSubmit = useCallback(async () => {
    setIsLoading(true);

    try {
      // Update problem details using server action directly
      const detailsResult = await updateProblemDetails(problem.id, {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        timeLimit: formData.timeLimit,
        memoryLimit: formData.memoryLimit,
      });

      if (!detailsResult.success) {
        throw new Error(
          detailsResult.error || "Failed to update problem details"
        );
      }

      // Update examples
      const examplesResult = await updateProblemExamples(
        problem.id,
        formData.examples
      );
      if (!examplesResult.success) {
        throw new Error(examplesResult.error || "Failed to update examples");
      }

      // Update starter code
      const starterCodeData = Object.entries(formData.starterCode).map(
        ([language, code]) => ({
          language,
          code: code as string,
        })
      );

      const starterCodeResult = await updateProblemStarterCode(
        problem.id,
        starterCodeData
      );

      if (!starterCodeResult.success) {
        throw new Error(
          starterCodeResult.error || "Failed to update starter code"
        );
      }

      // Update test cases
      const allTestCases = [
        ...formData.testCases.map((tc, index) => ({
          inputLines: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: false,
          order: index,
        })),
        ...formData.hiddenTestCases.map((tc, index) => ({
          inputLines: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: true,
          order: formData.testCases.length + index,
        })),
      ];

      const testCasesResult = await updateProblemTestCases(
        problem.id,
        allTestCases
      );

      if (!testCasesResult.success) {
        throw new Error(testCasesResult.error || "Failed to update test cases");
      }

      // Update constraints
      const constraintsData = formData.constraints.map((content, index) => ({
        content,
        order: index,
      }));

      const constraintsResult = await updateProblemConstraints(
        problem.id,
        constraintsData
      );

      if (!constraintsResult.success) {
        throw new Error(
          constraintsResult.error || "Failed to update constraints"
        );
      }

      // Update hints
      const hintsData = formData.hints.map((content, index) => ({
        content,
        order: index,
      }));

      const hintsResult = await updateProblemHints(problem.id, hintsData);

      if (!hintsResult.success) {
        throw new Error(hintsResult.error || "Failed to update hints");
      }

      toast.success("Problem updated successfully!", {
        description: `"${formData.title}" has been updated.`,
      });

      // Give the toast a moment to appear before redirecting
      setTimeout(() => {
        router.push(`/admin/problems/${problem.id}`);
        router.refresh();
      }, 500);
    } catch (error) {
      console.error("Error updating problem:", error);

      toast.error("Error updating problem", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, problem.id, router]);

  return (
    <div>
      <Tabs
        defaultValue="details"
        className="w-full"
        value={step}
        onValueChange={handleStepChange}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="code">Starter Code</TabsTrigger>
          <TabsTrigger value="testcases">Test Cases</TabsTrigger>
          <TabsTrigger value="hints">Hints & Constraints</TabsTrigger>
        </TabsList>

        {/* Only render the active tab content */}
        {step === "details" && (
          <TabsContent value="details" className="mt-6">
            <MemoizedDetailsTab
              problem={formData}
              handleInputChange={handlers.handleInputChange}
              onNext={() => setStep("examples")}
              problemId={problem.id}
              contestId={problem.contestId}
              userId={userId}
            />
          </TabsContent>
        )}

        {step === "examples" && (
          <TabsContent value="examples" className="mt-6">
            <MemoizedExamplesTab
              examples={formData.examples}
              handleExampleChange={handlers.handleExampleChange}
              addExample={handlers.addExample}
              removeExample={handlers.removeExample}
              onPrevious={() => setStep("details")}
              onNext={() => setStep("code")}
              problemId={problem.id}
            />
          </TabsContent>
        )}

        {step === "code" && (
          <TabsContent value="code" className="mt-6">
            <MemoizedStarterCodeTab
              starterCode={formData.starterCode}
              handleStarterCodeChange={handlers.handleStarterCodeChange}
              onPrevious={() => setStep("examples")}
              onNext={() => setStep("testcases")}
              problemId={problem.id}
            />
          </TabsContent>
        )}

        {step === "testcases" && (
          <TabsContent value="testcases" className="mt-6">
            <MemoizedTestCasesTab
              testCases={formData.testCases}
              hiddenTestCases={formData.hiddenTestCases}
              handlers={{
                handleTestCaseChange: handlers.handleTestCaseChange,
                handleTestCaseInputChange: handlers.handleTestCaseInputChange,
                addTestCase: handlers.addTestCase,
                removeTestCase: handlers.removeTestCase,
                addTestCaseInputLine: handlers.addTestCaseInputLine,
                removeTestCaseInputLine: handlers.removeTestCaseInputLine,
              }}
              onPrevious={() => setStep("code")}
              onNext={() => setStep("hints")}
              problemId={problem.id}
            />
          </TabsContent>
        )}

        {step === "hints" && (
          <TabsContent value="hints" className="mt-6">
            <MemoizedHintsConstraintsTab
              constraints={formData.constraints}
              hints={formData.hints}
              handleConstraintChange={handlers.handleConstraintChange}
              handleHintChange={handlers.handleHintChange}
              addConstraint={handlers.addConstraint}
              removeConstraint={handlers.removeConstraint}
              addHint={handlers.addHint}
              removeHint={handlers.removeHint}
              onPrevious={() => setStep("testcases")}
              isLoading={isLoading}
              problemId={problem.id}
              contestId={problem.contestId}
              onSubmit={onSubmit}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
