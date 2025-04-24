"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DetailsTab from "./details-tab";
import ExamplesTab from "../examples-tab";
import StarterCodeTab from "../starter-code-tab";
import TestCasesTab from "../test-cases-tab";
import HintsConstraintsTab from "../hints-constraints-tab";
import { useProblemForm } from "@/hooks/use-problem-form";
import { db } from "@/drizzle/db";
import { problems } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export default function EditProblemForm({
  problem: initialProblem,
  contestId,
  userId,
}: {
  problem: any;
  contestId: string;
  userId: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<string>("details");
  const { problem, setFullProblem, handlers } = useProblemForm(initialProblem);
  const problemId = initialProblem.id;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Check if we have a valid problem before proceeding
      if (!problemId || !problem.title) {
        throw new Error("Problem details are incomplete");
      }

      // Update the problem in the database
      await db
        .update(problems)
        .set({
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty?.toLowerCase() as
            | "easy"
            | "medium"
            | "hard",
          timeLimit: problem.timeLimit || "1 second",
          memoryLimit: problem.memoryLimit || "256 megabytes",
          updatedAt: new Date(),
        })
        .where(eq(problems.id, problemId));

      toast.success("Problem updated successfully!", {
        description: `"${problem.title}" has been updated.`,
      });

      // Give the toast a moment to appear before redirecting
      setTimeout(() => {
        router.push(`/admin/contests/${contestId}`);
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
    <form onSubmit={onSubmit}>
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
            problem={problem}
            handleInputChange={handlers.handleInputChange}
            onNext={() => setStep("examples")}
            contestId={contestId}
            setProblemId={() => {}} // Not needed for edit mode
            userId={userId}
            isEditMode={true}
            problemId={problemId}
          />
        </TabsContent>

        <TabsContent value="examples" className="mt-6">
          <ExamplesTab
            examples={problem.examples}
            handleExampleChange={handlers.handleExampleChange}
            addExample={handlers.addExample}
            removeExample={handlers.removeExample}
            onPrevious={() => setStep("details")}
            onNext={() => setStep("code")}
            problemId={problemId}
            isEditMode={true}
          />
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          <StarterCodeTab
            starterCode={problem.starterCode}
            handleStarterCodeChange={handlers.handleStarterCodeChange}
            onPrevious={() => setStep("examples")}
            onNext={() => setStep("testcases")}
            problemId={problemId}
            isEditMode={true}
          />
        </TabsContent>

        <TabsContent value="testcases" className="mt-6">
          <TestCasesTab
            testCases={problem.testCases}
            hiddenTestCases={problem.hiddenTestCases}
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
            problemId={problemId}
            isEditMode={true}
          />
        </TabsContent>

        <TabsContent value="hints" className="mt-6">
          <HintsConstraintsTab
            constraints={problem.constraints}
            hints={problem.hints}
            handleConstraintChange={handlers.handleConstraintChange}
            handleHintChange={handlers.handleHintChange}
            addConstraint={handlers.addConstraint}
            removeConstraint={handlers.removeConstraint}
            addHint={handlers.addHint}
            removeHint={handlers.removeHint}
            onPrevious={() => setStep("testcases")}
            isLoading={isLoading}
            problemId={problemId}
            contestId={contestId}
            isEditMode={true}
          />
        </TabsContent>
      </Tabs>
    </form>
  );
}
