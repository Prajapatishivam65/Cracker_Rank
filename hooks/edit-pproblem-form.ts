"use client";

import { useState } from "react";

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string[];
  expectedOutput: string;
}

export interface StarterCode {
  cpp: string;
  java: string;
  python: string;
}

export interface Problem {
  title: string;
  description: string;
  difficulty: string;
  timeLimit: string;
  memoryLimit: string;
  constraints: string[];
  hints: string[];
  examples: Example[];
  testCases: TestCase[];
  hiddenTestCases: TestCase[];
  starterCode: StarterCode;
}

interface UseProblemFormProps {
  initialData?: Partial<Problem>;
}

export function useProblemForm({ initialData }: UseProblemFormProps = {}) {
  const [problem, setProblem] = useState<Problem>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    difficulty: initialData?.difficulty || "Medium",
    timeLimit: initialData?.timeLimit || "1 second",
    memoryLimit: initialData?.memoryLimit || "256 megabytes",
    constraints: initialData?.constraints || [""],
    hints: initialData?.hints || [""],
    examples:
      initialData?.examples && initialData.examples.length > 0
        ? initialData.examples
        : [{ input: "", output: "", explanation: "" }],
    testCases:
      initialData?.testCases && initialData.testCases.length > 0
        ? initialData.testCases
        : [{ input: [""], expectedOutput: "" }],
    hiddenTestCases:
      initialData?.hiddenTestCases && initialData.hiddenTestCases.length > 0
        ? initialData.hiddenTestCases
        : [{ input: [""], expectedOutput: "" }],
    starterCode: {
      cpp: initialData?.starterCode?.cpp || "",
      java: initialData?.starterCode?.java || "",
      python: initialData?.starterCode?.python || "",
    },
  });

  // Handler for basic input fields
  const handleInputChange = (field: keyof Problem, value: any) => {
    setProblem((prev) => ({ ...prev, [field]: value }));
  };

  // Handlers for examples
  const handleExampleChange = (
    index: number,
    field: keyof Example,
    value: string
  ) => {
    setProblem((prev) => {
      const updatedExamples = [...prev.examples];
      updatedExamples[index] = {
        ...updatedExamples[index],
        [field]: value,
      };
      return { ...prev, examples: updatedExamples };
    });
  };

  const addExample = () => {
    setProblem((prev) => ({
      ...prev,
      examples: [...prev.examples, { input: "", output: "", explanation: "" }],
    }));
  };

  const removeExample = (index: number) => {
    if (problem.examples.length <= 1) {
      return; // Don't remove the last example
    }

    setProblem((prev) => {
      const updatedExamples = [...prev.examples];
      updatedExamples.splice(index, 1);
      return { ...prev, examples: updatedExamples };
    });
  };

  // Handlers for constraints
  const handleConstraintChange = (index: number, value: string) => {
    setProblem((prev) => {
      const updatedConstraints = [...prev.constraints];
      updatedConstraints[index] = value;
      return { ...prev, constraints: updatedConstraints };
    });
  };

  const addConstraint = () => {
    setProblem((prev) => ({
      ...prev,
      constraints: [...prev.constraints, ""],
    }));
  };

  const removeConstraint = (index: number) => {
    if (problem.constraints.length <= 1) {
      return; // Don't remove the last constraint
    }

    setProblem((prev) => {
      const updatedConstraints = [...prev.constraints];
      updatedConstraints.splice(index, 1);
      return { ...prev, constraints: updatedConstraints };
    });
  };

  // Handlers for hints
  const handleHintChange = (index: number, value: string) => {
    setProblem((prev) => {
      const updatedHints = [...prev.hints];
      updatedHints[index] = value;
      return { ...prev, hints: updatedHints };
    });
  };

  const addHint = () => {
    setProblem((prev) => ({
      ...prev,
      hints: [...prev.hints, ""],
    }));
  };

  const removeHint = (index: number) => {
    if (problem.hints.length <= 1) {
      return; // Don't remove the last hint
    }

    setProblem((prev) => {
      const updatedHints = [...prev.hints];
      updatedHints.splice(index, 1);
      return { ...prev, hints: updatedHints };
    });
  };

  // Handlers for starter code
  const handleStarterCodeChange = (
    language: keyof StarterCode,
    code: string
  ) => {
    setProblem((prev) => ({
      ...prev,
      starterCode: {
        ...prev.starterCode,
        [language]: code,
      },
    }));
  };

  // Handlers for test cases
  const handleTestCaseChange = (
    type: "testCases" | "hiddenTestCases",
    index: number,
    field: "input" | "expectedOutput",
    value: string | string[]
  ) => {
    setProblem((prev) => {
      const updatedTestCases = [...prev[type]];
      updatedTestCases[index] = {
        ...updatedTestCases[index],
        [field]: value,
      };
      return { ...prev, [type]: updatedTestCases };
    });
  };

  const handleTestCaseInputChange = (
    type: "testCases" | "hiddenTestCases",
    testCaseIndex: number,
    lineIndex: number,
    value: string
  ) => {
    setProblem((prev) => {
      const updatedTestCases = [...prev[type]];
      const updatedInput = [...updatedTestCases[testCaseIndex].input];
      updatedInput[lineIndex] = value;
      updatedTestCases[testCaseIndex] = {
        ...updatedTestCases[testCaseIndex],
        input: updatedInput,
      };
      return { ...prev, [type]: updatedTestCases };
    });
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
    if (problem[type].length <= 1) {
      return; // Don't remove the last test case
    }

    setProblem((prev) => {
      const updatedTestCases = [...prev[type]];
      updatedTestCases.splice(index, 1);
      return { ...prev, [type]: updatedTestCases };
    });
  };

  const addTestCaseInputLine = (
    type: "testCases" | "hiddenTestCases",
    testCaseIndex: number
  ) => {
    setProblem((prev) => {
      const updatedTestCases = [...prev[type]];
      const updatedInput = [...updatedTestCases[testCaseIndex].input, ""];
      updatedTestCases[testCaseIndex] = {
        ...updatedTestCases[testCaseIndex],
        input: updatedInput,
      };
      return { ...prev, [type]: updatedTestCases };
    });
  };

  const removeTestCaseInputLine = (
    type: "testCases" | "hiddenTestCases",
    testCaseIndex: number,
    lineIndex: number
  ) => {
    if (problem[type][testCaseIndex].input.length <= 1) {
      return; // Don't remove the last input line
    }

    setProblem((prev) => {
      const updatedTestCases = [...prev[type]];
      const updatedInput = [...updatedTestCases[testCaseIndex].input];
      updatedInput.splice(lineIndex, 1);
      updatedTestCases[testCaseIndex] = {
        ...updatedTestCases[testCaseIndex],
        input: updatedInput,
      };
      return { ...prev, [type]: updatedTestCases };
    });
  };

  return {
    problem,
    handlers: {
      handleInputChange,
      handleExampleChange,
      addExample,
      removeExample,
      handleConstraintChange,
      addConstraint,
      removeConstraint,
      handleHintChange,
      addHint,
      removeHint,
      handleStarterCodeChange,
      handleTestCaseChange,
      handleTestCaseInputChange,
      addTestCase,
      removeTestCase,
      addTestCaseInputLine,
      removeTestCaseInputLine,
    },
  };
}
