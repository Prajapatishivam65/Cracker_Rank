"use client";

import { useState } from "react";

// Define types based on your schema structure
export type Example = {
  input: string;
  output: string;
  explanation?: string;
};

export type StarterCode = {
  [language: string]: string;
};

export type TestCase = {
  input: string[];
  expectedOutput: string;
};

export type Problem = {
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

export function useProblemForm() {
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

  return {
    problem,
    handlers: {
      handleInputChange,
      handleConstraintChange,
      handleHintChange,
      handleExampleChange,
      handleStarterCodeChange,
      handleTestCaseChange,
      handleTestCaseInputChange,
      addTestCaseInputLine,
      removeTestCaseInputLine,
      addConstraint,
      removeConstraint,
      addHint,
      removeHint,
      addExample,
      removeExample,
      addTestCase,
      removeTestCase,
    },
  };
}
