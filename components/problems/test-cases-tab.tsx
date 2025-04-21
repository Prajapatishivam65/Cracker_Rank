"use client";

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
}

export default function TestCasesTab({
  testCases,
  hiddenTestCases,
  handlers,
  onPrevious,
  onNext,
}: TestCasesTabProps) {
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
        <Button type="button" onClick={onNext}>
          Next: Hints & Constraints
        </Button>
      </CardFooter>
    </Card>
  );
}
