"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import type { TestCase } from "@/hooks/use-problem-form";

interface TestCasesTabProps {
  testCases: TestCase[];
  hiddenTestCases: TestCase[];
  handlers: {
    handleTestCaseChange: (
      type: "testCases" | "hiddenTestCases",
      index: number,
      field: "input" | "expectedOutput",
      value: string | string[]
    ) => void;
    handleTestCaseInputChange: (
      type: "testCases" | "hiddenTestCases",
      testCaseIndex: number,
      lineIndex: number,
      value: string
    ) => void;
    addTestCase: (type: "testCases" | "hiddenTestCases") => void;
    removeTestCase: (
      type: "testCases" | "hiddenTestCases",
      index: number
    ) => void;
    addTestCaseInputLine: (
      type: "testCases" | "hiddenTestCases",
      testCaseIndex: number
    ) => void;
    removeTestCaseInputLine: (
      type: "testCases" | "hiddenTestCases",
      testCaseIndex: number,
      lineIndex: number
    ) => void;
  };
  onPrevious: () => void;
  onNext: () => void;
  problemId: string | null;
}

export default function TestCasesTab({
  testCases,
  hiddenTestCases,
  handlers,
  onPrevious,
  onNext,
  problemId,
}: TestCasesTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveTestCases = async () => {
    if (!problemId) {
      toast.error("Problem ID missing", {
        description: "Please save the problem details first.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Save visible test cases
      console.log("Saving visible test cases");
      const testCasePromises = testCases
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
      console.log(`Saved ${testCasePromises.length} visible test cases`);

      // Save hidden test cases
      console.log("Saving hidden test cases");
      const hiddenTestCasePromises = hiddenTestCases
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
      console.log(`Saved ${hiddenTestCasePromises.length} hidden test cases`);

      toast.success("Test cases saved", {
        description: "You can now add hints and constraints to your problem.",
      });

      onNext();
    } catch (error) {
      console.error("Error saving test cases:", error);
      toast.error("Error saving test cases", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Cases</CardTitle>
        <CardDescription>
          Add visible and hidden test cases for the problem.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* VISIBLE TEST CASES */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Visible Test Cases</h3>
          {testCases.map((testCase, tcIndex) => (
            <div key={tcIndex} className="rounded-md border p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium">Test Case {tcIndex + 1}</h4>
                {testCases.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlers.removeTestCase("testCases", tcIndex)
                    }
                  >
                    <Trash className="h-4 w-4 mr-1" /> Remove
                  </Button>
                )}
              </div>

              <div className="mb-4 space-y-4">
                <div className="space-y-2">
                  <Label>Input Lines</Label>
                  {testCase.input.map((line, lineIndex) => (
                    <div key={lineIndex} className="flex gap-2">
                      <Input
                        value={line}
                        placeholder={`Line ${lineIndex + 1}`}
                        onChange={(e) =>
                          handlers.handleTestCaseInputChange(
                            "testCases",
                            tcIndex,
                            lineIndex,
                            e.target.value
                          )
                        }
                      />
                      {testCase.input.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handlers.removeTestCaseInputLine(
                              "testCases",
                              tcIndex,
                              lineIndex
                            )
                          }
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlers.addTestCaseInputLine("testCases", tcIndex)
                    }
                  >
                    Add Input Line
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`testcase-output-${tcIndex}`}>
                    Expected Output
                  </Label>
                  <Textarea
                    id={`testcase-output-${tcIndex}`}
                    rows={2}
                    placeholder="Expected output"
                    value={testCase.expectedOutput}
                    onChange={(e) =>
                      handlers.handleTestCaseChange(
                        "testCases",
                        tcIndex,
                        "expectedOutput",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => handlers.addTestCase("testCases")}
          >
            Add Test Case
          </Button>
        </div>

        {/* HIDDEN TEST CASES */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Hidden Test Cases</h3>
          {hiddenTestCases.map((testCase, tcIndex) => (
            <div key={tcIndex} className="rounded-md border p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium">Hidden Test Case {tcIndex + 1}</h4>
                {hiddenTestCases.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlers.removeTestCase("hiddenTestCases", tcIndex)
                    }
                  >
                    <Trash className="h-4 w-4 mr-1" /> Remove
                  </Button>
                )}
              </div>

              <div className="mb-4 space-y-4">
                <div className="space-y-2">
                  <Label>Input Lines</Label>
                  {testCase.input.map((line, lineIndex) => (
                    <div key={lineIndex} className="flex gap-2">
                      <Input
                        value={line}
                        placeholder={`Line ${lineIndex + 1}`}
                        onChange={(e) =>
                          handlers.handleTestCaseInputChange(
                            "hiddenTestCases",
                            tcIndex,
                            lineIndex,
                            e.target.value
                          )
                        }
                      />
                      {testCase.input.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handlers.removeTestCaseInputLine(
                              "hiddenTestCases",
                              tcIndex,
                              lineIndex
                            )
                          }
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlers.addTestCaseInputLine("hiddenTestCases", tcIndex)
                    }
                  >
                    Add Input Line
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`hidden-testcase-output-${tcIndex}`}>
                    Expected Output
                  </Label>
                  <Textarea
                    id={`hidden-testcase-output-${tcIndex}`}
                    rows={2}
                    placeholder="Expected output"
                    value={testCase.expectedOutput}
                    onChange={(e) =>
                      handlers.handleTestCaseChange(
                        "hiddenTestCases",
                        tcIndex,
                        "expectedOutput",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => handlers.addTestCase("hiddenTestCases")}
          >
            Add Hidden Test Case
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between space-x-2">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous: Starter Code
        </Button>
        <Button
          type="button"
          onClick={handleSaveTestCases}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save & Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
