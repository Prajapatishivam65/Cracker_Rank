import { useState, useCallback, useMemo } from "react";

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

export function useProblemForm(props: {
  initialData: {
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
  };
}) {
  // Use lazy initialization for complex state
  const [problem, setProblem] = useState<Problem>(() => ({
    title: props.initialData.title || "",
    description: props.initialData.description || "",
    difficulty:
      (props.initialData.difficulty as "Easy" | "Medium" | "Hard") || "Medium",
    timeLimit: props.initialData.timeLimit || "1 second",
    memoryLimit: props.initialData.memoryLimit || "256 megabytes",
    constraints:
      props.initialData.constraints?.length > 0
        ? props.initialData.constraints
        : [""],
    examples:
      props.initialData.examples?.length > 0
        ? props.initialData.examples
        : [{ input: "", output: "", explanation: "" }],
    hints: props.initialData.hints?.length > 0 ? props.initialData.hints : [""],
    starterCode: {
      cpp: props.initialData.starterCode?.cpp || "",
      java: props.initialData.starterCode?.java || "",
      python: props.initialData.starterCode?.python || "",
    },
    testCases:
      props.initialData.testCases?.length > 0
        ? props.initialData.testCases
        : [{ input: [""], expectedOutput: "" }],
    hiddenTestCases:
      props.initialData.hiddenTestCases?.length > 0
        ? props.initialData.hiddenTestCases
        : [{ input: [""], expectedOutput: "" }],
  }));

  // Memoize update functions
  const handleInputChange = useCallback((field: keyof Problem, value: any) => {
    setProblem((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleConstraintChange = useCallback((index: number, value: string) => {
    setProblem((prev) => {
      const newConstraints = [...prev.constraints];
      newConstraints[index] = value;
      return { ...prev, constraints: newConstraints };
    });
  }, []);

  const handleHintChange = useCallback((index: number, value: string) => {
    setProblem((prev) => {
      const newHints = [...prev.hints];
      newHints[index] = value;
      return { ...prev, hints: newHints };
    });
  }, []);

  const handleExampleChange = useCallback(
    (index: number, field: keyof Example, value: string) => {
      setProblem((prev) => {
        const newExamples = [...prev.examples];
        newExamples[index] = { ...newExamples[index], [field]: value };
        return { ...prev, examples: newExamples };
      });
    },
    []
  );

  const handleStarterCodeChange = useCallback(
    (language: string, code: string) => {
      setProblem((prev) => ({
        ...prev,
        starterCode: { ...prev.starterCode, [language]: code },
      }));
    },
    []
  );

  const handleTestCaseChange = useCallback(
    (
      type: "testCases" | "hiddenTestCases",
      index: number,
      field: "input" | "expectedOutput",
      value: string | string[]
    ) => {
      setProblem((prev) => {
        const newTestCases = [...prev[type]];
        newTestCases[index] = { ...newTestCases[index], [field]: value };
        return { ...prev, [type]: newTestCases };
      });
    },
    []
  );

  const handleTestCaseInputChange = useCallback(
    (
      type: "testCases" | "hiddenTestCases",
      testCaseIndex: number,
      lineIndex: number,
      value: string
    ) => {
      setProblem((prev) => {
        const newTestCases = [...prev[type]];
        const newInputs = [...newTestCases[testCaseIndex].input];
        newInputs[lineIndex] = value;
        newTestCases[testCaseIndex] = {
          ...newTestCases[testCaseIndex],
          input: newInputs,
        };
        return { ...prev, [type]: newTestCases };
      });
    },
    []
  );

  const addTestCaseInputLine = useCallback(
    (type: "testCases" | "hiddenTestCases", testCaseIndex: number) => {
      setProblem((prev) => {
        const newTestCases = [...prev[type]];
        const testCase = newTestCases[testCaseIndex];
        newTestCases[testCaseIndex] = {
          ...testCase,
          input: [...testCase.input, ""],
        };
        return { ...prev, [type]: newTestCases };
      });
    },
    []
  );

  const removeTestCaseInputLine = useCallback(
    (
      type: "testCases" | "hiddenTestCases",
      testCaseIndex: number,
      lineIndex: number
    ) => {
      setProblem((prev) => {
        const newTestCases = [...prev[type]];
        const testCase = newTestCases[testCaseIndex];
        newTestCases[testCaseIndex] = {
          ...testCase,
          input: testCase.input.filter((_, i) => i !== lineIndex),
        };
        return { ...prev, [type]: newTestCases };
      });
    },
    []
  );

  const addConstraint = useCallback(() => {
    setProblem((prev) => ({
      ...prev,
      constraints: [...prev.constraints, ""],
    }));
  }, []);

  const removeConstraint = useCallback((index: number) => {
    setProblem((prev) => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index),
    }));
  }, []);

  const addHint = useCallback(() => {
    setProblem((prev) => ({
      ...prev,
      hints: [...prev.hints, ""],
    }));
  }, []);

  const removeHint = useCallback((index: number) => {
    setProblem((prev) => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index),
    }));
  }, []);

  const addExample = useCallback(() => {
    setProblem((prev) => ({
      ...prev,
      examples: [...prev.examples, { input: "", output: "", explanation: "" }],
    }));
  }, []);

  const removeExample = useCallback((index: number) => {
    setProblem((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  }, []);

  const addTestCase = useCallback((type: "testCases" | "hiddenTestCases") => {
    setProblem((prev) => ({
      ...prev,
      [type]: [...prev[type], { input: [""], expectedOutput: "" }],
    }));
  }, []);

  const removeTestCase = useCallback(
    (type: "testCases" | "hiddenTestCases", index: number) => {
      setProblem((prev) => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index),
      }));
    },
    []
  );

  // Memoize handlers object to prevent unnecessary re-renders in child components
  const handlers = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return {
    problem,
    handlers,
  };
}
