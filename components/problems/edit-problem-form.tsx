"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DetailsTab from "./edit/details-tab";
import ExamplesTab from "./edit/examples-tab";
import StarterCodeTab from "./edit/starter-code-tab";
import TestCasesTab from "./edit/test-cases-tab";
import HintsConstraintsTab from "./edit/hints-constraints-tab";
import { useProblemForm } from "@/hooks/use-problem-form";

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
    examples: {
      input: string;
      output: string;
      explanation?: string;
    }[];
    testCases: {
      input: string[];
      expectedOutput: string;
    }[];
    hiddenTestCases: {
      input: string[];
      expectedOutput: string;
    }[];
    starterCode: {
      cpp: string;
      java: string;
      python: string;
    };
    contestId: string;
    createdBy: string;
    order: number;
  };
  userId: string;
}

export default function EditProblemForm({
  problem,
  userId,
}: EditProblemFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<string>("details");

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

  async function onSubmit() {
    setIsLoading(true);

    try {
      // Add the actual API call to update the problem
      const response = await fetch(`/api/problems/${problem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          contestId: problem.contestId,
          createdBy: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update problem");
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
  }

  return (
    <div>
      <Tabs
        defaultValue="details"
        className="w-full"
        value={step}
        onValueChange={setStep}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="code">Starter Code</TabsTrigger>
          <TabsTrigger value="testcases">Test Cases</TabsTrigger>
          <TabsTrigger value="hints">Hints & Constraints</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <DetailsTab
            problem={formData}
            handleInputChange={handlers.handleInputChange}
            onNext={() => setStep("examples")}
            problemId={problem.id}
            contestId={problem.contestId}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="examples" className="mt-6">
          <ExamplesTab
            examples={formData.examples}
            handleExampleChange={handlers.handleExampleChange}
            addExample={handlers.addExample}
            removeExample={handlers.removeExample}
            onPrevious={() => setStep("details")}
            onNext={() => setStep("code")}
            problemId={problem.id}
          />
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          <StarterCodeTab
            starterCode={formData.starterCode}
            handleStarterCodeChange={handlers.handleStarterCodeChange}
            onPrevious={() => setStep("examples")}
            onNext={() => setStep("testcases")}
            problemId={problem.id}
          />
        </TabsContent>

        <TabsContent value="testcases" className="mt-6">
          <TestCasesTab
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

        <TabsContent value="hints" className="mt-6">
          <HintsConstraintsTab
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
      </Tabs>
    </div>
  );
}
