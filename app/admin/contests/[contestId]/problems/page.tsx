"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash } from "lucide-react";

// Define types based on your sample problem structure
type Example = {
  input: string;
  output: string;
  explanation?: string;
};

type StarterCode = {
  [language: string]: string;
};

type TestCase = {
  input: string[];
  expectedOutput: string;
};

type Problem = {
  id?: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: string;
  memoryLimit: string;
  constraints: string[];
  examples: Example[];
  hints: string[];
  starterCode: StarterCode;
  testCases: TestCase[];
  hiddenTestCases: TestCase[];
};

export default function NewProblemPage({
  params,
}: {
  params: { contestId: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize problem state with default empty values
  const [problem, setProblem] = useState<Problem>({
    title: "",
    description: "",
    difficulty: "Medium",
    timeLimit: "1 second",
    memoryLimit: "256 megabytes",
    constraints: [""],
    examples: [{ input: "", output: "", explanation: "" }],
    hints: [""],
    starterCode: {
      cpp: "",
      java: "",
      python: "",
    },
    testCases: [{ input: [""], expectedOutput: "" }],
    hiddenTestCases: [{ input: [""], expectedOutput: "" }],
  });

  // Helper functions for updating arrays
  const updateArray = (array: any[], index: number, value: any) => {
    const newArray = [...array];
    newArray[index] = value;
    return newArray;
  };

  const addArrayItem = (array: any[], item: any) => {
    return [...array, item];
  };

  const removeArrayItem = (array: any[], index: number) => {
    return array.filter((_, i) => i !== index);
  };

  // Update handlers
  const handleInputChange = (field: keyof Problem, value: any) => {
    setProblem((prev) => ({ ...prev, [field]: value }));
  };

  const handleConstraintChange = (index: number, value: string) => {
    setProblem((prev) => ({
      ...prev,
      constraints: updateArray(prev.constraints, index, value),
    }));
  };

  const handleHintChange = (index: number, value: string) => {
    setProblem((prev) => ({
      ...prev,
      hints: updateArray(prev.hints, index, value),
    }));
  };

  const handleExampleChange = (
    index: number,
    field: keyof Example,
    value: string
  ) => {
    setProblem((prev) => ({
      ...prev,
      examples: updateArray(prev.examples, index, {
        ...prev.examples[index],
        [field]: value,
      }),
    }));
  };

  const handleStarterCodeChange = (language: string, code: string) => {
    setProblem((prev) => ({
      ...prev,
      starterCode: { ...prev.starterCode, [language]: code },
    }));
  };

  const handleTestCaseChange = (
    type: "testCases" | "hiddenTestCases",
    index: number,
    field: "input" | "expectedOutput",
    value: string | string[]
  ) => {
    setProblem((prev) => ({
      ...prev,
      [type]: updateArray(prev[type], index, {
        ...prev[type][index],
        [field]: value,
      }),
    }));
  };

  // Function to handle test case input lines
  const handleTestCaseInputChange = (
    type: "testCases" | "hiddenTestCases",
    testCaseIndex: number,
    lineIndex: number,
    value: string
  ) => {
    setProblem((prev) => {
      const testCase = prev[type][testCaseIndex];
      const newInput = [...testCase.input];
      newInput[lineIndex] = value;

      return {
        ...prev,
        [type]: updateArray(prev[type], testCaseIndex, {
          ...testCase,
          input: newInput,
        }),
      };
    });
  };

  // Add/remove line in test case input
  const addTestCaseInputLine = (
    type: "testCases" | "hiddenTestCases",
    testCaseIndex: number
  ) => {
    setProblem((prev) => {
      const testCase = prev[type][testCaseIndex];
      return {
        ...prev,
        [type]: updateArray(prev[type], testCaseIndex, {
          ...testCase,
          input: [...testCase.input, ""],
        }),
      };
    });
  };

  const removeTestCaseInputLine = (
    type: "testCases" | "hiddenTestCases",
    testCaseIndex: number,
    lineIndex: number
  ) => {
    setProblem((prev) => {
      const testCase = prev[type][testCaseIndex];
      const newInput = testCase.input.filter((_, i) => i !== lineIndex);
      return {
        ...prev,
        [type]: updateArray(prev[type], testCaseIndex, {
          ...testCase,
          input: newInput,
        }),
      };
    });
  };

  // Add/remove functions
  const addConstraint = () => {
    setProblem((prev) => ({
      ...prev,
      constraints: [...prev.constraints, ""],
    }));
  };

  const removeConstraint = (index: number) => {
    setProblem((prev) => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index),
    }));
  };

  const addHint = () => {
    setProblem((prev) => ({
      ...prev,
      hints: [...prev.hints, ""],
    }));
  };

  const removeHint = (index: number) => {
    setProblem((prev) => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index),
    }));
  };

  const addExample = () => {
    setProblem((prev) => ({
      ...prev,
      examples: [...prev.examples, { input: "", output: "", explanation: "" }],
    }));
  };

  const removeExample = (index: number) => {
    setProblem((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  const addTestCase = (type: "testCases" | "hiddenTestCases") => {
    setProblem((prev) => ({
      ...prev,
      [type]: [...prev[type], { input: [""], expectedOutput: "" }],
    }));
  };

  const removeTestCase = (
    type: "testCases" | "hiddenTestCases",
    index: number
  ) => {
    setProblem((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    // In a real app, you would submit to your backend
    // For example:
    try {
      // Format any data if needed before submission
      const formattedProblem = {
        ...problem,
        contestId: params.contestId,
      };

      console.log("Submitting problem:", formattedProblem);

      // Mock API call
      // await fetch('/api/problems', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formattedProblem),
      // });

      // For demo purposes, just redirect after a delay
      setTimeout(() => {
        router.push(`/admin/contests/${params.contestId}`);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error creating problem:", error);
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">Add New Problem</h1>
      <p className="mb-6 text-gray-600">
        Creating problem for Contest ID: {params.contestId}
      </p>

      <form onSubmit={onSubmit}>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="code">Starter Code</TabsTrigger>
            <TabsTrigger value="testcases">Test Cases</TabsTrigger>
            <TabsTrigger value="hints">Hints & Constraints</TabsTrigger>
          </TabsList>

          {/* DETAILS TAB */}
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Problem Details</CardTitle>
                <CardDescription>
                  Define the problem statement and basic information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Problem Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Remove the Blockers!"
                    value={problem.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <select
                    id="difficulty"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={problem.difficulty}
                    onChange={(e) =>
                      handleInputChange("difficulty", e.target.value)
                    }
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Problem Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the problem in detail... Markdown is supported."
                    rows={12}
                    value={problem.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit</Label>
                    <Input
                      id="timeLimit"
                      placeholder="e.g., 1 second"
                      value={problem.timeLimit}
                      onChange={(e) =>
                        handleInputChange("timeLimit", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memoryLimit">Memory Limit</Label>
                    <Input
                      id="memoryLimit"
                      placeholder="e.g., 256 megabytes"
                      value={problem.memoryLimit}
                      onChange={(e) =>
                        handleInputChange("memoryLimit", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXAMPLES TAB */}
          <TabsContent value="examples" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Examples</CardTitle>
                <CardDescription>
                  Add sample inputs, outputs, and explanations for the problem.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {problem.examples.map((example, index) => (
                  <div key={index} className="rounded-md border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        Example {index + 1}
                      </h3>
                      {problem.examples.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeExample(index)}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`example-input-${index}`}>Input</Label>
                        <Textarea
                          id={`example-input-${index}`}
                          rows={3}
                          placeholder="Input example"
                          value={example.input}
                          onChange={(e) =>
                            handleExampleChange(index, "input", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`example-output-${index}`}>
                          Output
                        </Label>
                        <Textarea
                          id={`example-output-${index}`}
                          rows={3}
                          placeholder="Expected output"
                          value={example.output}
                          onChange={(e) =>
                            handleExampleChange(index, "output", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`example-explanation-${index}`}>
                          Explanation (optional)
                        </Label>
                        <Textarea
                          id={`example-explanation-${index}`}
                          rows={4}
                          placeholder="Explain how the output is derived from the input"
                          value={example.explanation || ""}
                          onChange={(e) =>
                            handleExampleChange(
                              index,
                              "explanation",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addExample}>
                  Add Another Example
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STARTER CODE TAB */}
          <TabsContent value="code" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Starter Code</CardTitle>
                <CardDescription>
                  Provide starter code templates for different languages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpp-code">C++</Label>
                    <Textarea
                      id="cpp-code"
                      rows={10}
                      placeholder="C++ starter code"
                      value={problem.starterCode.cpp}
                      onChange={(e) =>
                        handleStarterCodeChange("cpp", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="java-code">Java</Label>
                    <Textarea
                      id="java-code"
                      rows={10}
                      placeholder="Java starter code"
                      value={problem.starterCode.java}
                      onChange={(e) =>
                        handleStarterCodeChange("java", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="python-code">Python</Label>
                    <Textarea
                      id="python-code"
                      rows={10}
                      placeholder="Python starter code"
                      value={problem.starterCode.python}
                      onChange={(e) =>
                        handleStarterCodeChange("python", e.target.value)
                      }
                    />
                  </div>
                  {/* You can add more languages or make this dynamic if needed */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEST CASES TAB */}
          <TabsContent value="testcases" className="mt-6">
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
                  {problem.testCases.map((testCase, tcIndex) => (
                    <div key={tcIndex} className="rounded-md border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium">Test Case {tcIndex + 1}</h4>
                        {problem.testCases.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTestCase("testCases", tcIndex)}
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
                                  handleTestCaseInputChange(
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
                                    removeTestCaseInputLine(
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
                              addTestCaseInputLine("testCases", tcIndex)
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
                              handleTestCaseChange(
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
                    onClick={() => addTestCase("testCases")}
                  >
                    Add Test Case
                  </Button>
                </div>

                {/* HIDDEN TEST CASES */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hidden Test Cases</h3>
                  {problem.hiddenTestCases.map((testCase, tcIndex) => (
                    <div key={tcIndex} className="rounded-md border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium">
                          Hidden Test Case {tcIndex + 1}
                        </h4>
                        {problem.hiddenTestCases.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeTestCase("hiddenTestCases", tcIndex)
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
                                  handleTestCaseInputChange(
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
                                    removeTestCaseInputLine(
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
                              addTestCaseInputLine("hiddenTestCases", tcIndex)
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
                              handleTestCaseChange(
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
                    onClick={() => addTestCase("hiddenTestCases")}
                  >
                    Add Hidden Test Case
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HINTS & CONSTRAINTS TAB */}
          <TabsContent value="hints" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Hints & Constraints</CardTitle>
                <CardDescription>
                  Add problem constraints and hints for participants.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CONSTRAINTS */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Constraints</h3>
                  {problem.constraints.map((constraint, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., 1 ≤ N ≤ 100"
                        value={constraint}
                        onChange={(e) =>
                          handleConstraintChange(index, e.target.value)
                        }
                      />
                      {problem.constraints.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeConstraint(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addConstraint}
                  >
                    Add Constraint
                  </Button>
                </div>

                {/* HINTS */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hints</h3>
                  {problem.hints.map((hint, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Provide a helpful hint"
                        value={hint}
                        onChange={(e) =>
                          handleHintChange(index, e.target.value)
                        }
                      />
                      {problem.hints.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeHint(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addHint}>
                    Add Hint
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Problem"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
