"use client";

import { useState, useEffect, useRef } from "react";
import CodeEditor from "./code-editor";
import ProblemDescription from "./problem-description";
import TestResults from "./test-results";
import SubmissionHistory from "./submission-history";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { executeCode } from "@/lib/code-execution";
import { formatCode } from "@/lib/code-formatter";
import {
  createSubmission,
  executeSubmission,
} from "@/actions/submission-actions";
import { ModeToggle } from "./theme-toggle";
import { useMobile } from "@/hooks/use-mobile";
import {
  Loader2,
  Play,
  Send,
  FileCode,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  LayoutPanelLeft,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for our problem structure
interface TestCase {
  input: any[];
  expectedOutput: string;
}

interface ProblemStarter {
  java: string;
  cpp: string;
  python: string;
  [key: string]: string;
}

interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  constraints: string[];
  examples: ProblemExample[];
  hints: string[];
  starterCode: ProblemStarter;
  testCases: TestCase[];
  hiddenTestCases: TestCase[];
  timeLimit?: string;
  memoryLimit?: string;
}

interface TestResult {
  testCaseIndex: number;
  input: any[];
  expectedOutput: string;
  actualOutput: string | null;
  error: string | null;
  passed: boolean;
  isHidden?: boolean;
}

interface CodeEditorPlatformProps {
  problem?: Problem;
}

// Sample problem for testing in competitive programming format
const sampleProblem: Problem = {
  id: "remove-blockers-to-see",
  title: "Remove the Blockers!",
  description: `At the cultural fest, Anaya finds herself stuck in a crowd again. This time, she doesn't want to move — instead, she wonders if removing some blockers ahead could help her get a clear view.

There are N students in a queue, with heights given in the array H. Anaya is standing at the **front** of the queue (index 0), and she can only see the performance if **no student ahead of her in the queue (i.e., to the right) is taller than or equal to her**.

She has the ability to remove any number of students ahead of her to get a clear view. Your task is to calculate the **minimum number of students that need to be removed** so Anaya can see the performance.

If she can already see, the answer is 0.`,

  difficulty: "Medium",
  timeLimit: "1 second",
  memoryLimit: "256 megabytes",
  constraints: ["1 ≤ T ≤ 100", "2 ≤ N ≤ 100", "1 ≤ H[i] ≤ 100"],
  examples: [
    {
      input: `3
5
5 4 3 2 1
4
4 5 3 2
6
6 6 6 6 6 6`,
      output: `0
1
5`,
      explanation: `Test Case 1:
Anaya (height 5) is already taller than all to her right — no need to remove anyone.

Test Case 2:
Only student at index 1 (height 5) blocks her view — remove them.

Test Case 3:
All students have the same height (6) — Anaya must remove everyone else to see the stage.`,
    },
  ],
  hints: [
    "Iterate through the heights to the right of Anaya.",
    "Count how many students are taller than or equal to Anaya.",
    "Removing the minimum such students gives the answer.",
  ],
  starterCode: {
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int T;
    cin >> T;
    while (T--) {
        int N;
        cin >> N;
        vector<int> H(N);
        for (int &h : H) cin >> h;

        int blockers = 0;
        for (int i = 1; i < N; ++i) {
            if (H[i] >= H[0]) {
                blockers++;
            }
        }

        cout << blockers << endl;
    }
    return 0;
}
`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int T = sc.nextInt();
        while (T-- > 0) {
            int N = sc.nextInt();
            int[] H = new int[N];
            for (int i = 0; i < N; i++) {
                H[i] = sc.nextInt();
            }

            int blockers = 0;
            for (int i = 1; i < N; i++) {
                if (H[i] >= H[0]) {
                    blockers++;
                }
            }

            System.out.println(blockers);
        }
    }
}
`,
    python: `T = int(input())
for _ in range(T):
    N = int(input())
    H = list(map(int, input().split()))
    blockers = 0

    for i in range(1, N):
        if H[i] >= H[0]:
            blockers += 1

    print(blockers)
`,
  },
  testCases: [
    {
      input: ["1", "5", "5 4 3 2 1"],
      expectedOutput: "0",
    },
    {
      input: ["1", "4", "4 5 3 2"],
      expectedOutput: "1",
    },
    {
      input: ["1", "6", "6 6 6 6 6 6"],
      expectedOutput: "5",
    },
  ],
  hiddenTestCases: [
    {
      input: ["1", "4", "3 4 5 2"],
      expectedOutput: "2",
    },
    {
      input: ["1", "3", "7 2 1"],
      expectedOutput: "0",
    },
    {
      input: ["1", "5", "1 2 3 4 5"],
      expectedOutput: "4",
    },
  ],
};

export default function CodeEditorPlatformEnhanced({
  problem,
}: CodeEditorPlatformProps) {
  // Use the provided problem or fall back to the sample problem
  const currentProblem: Problem = problem || sampleProblem;

  const [language, setLanguage] = useState<string>("cpp"); // Default to C++ for competitive programming
  const [code, setCode] = useState<string>(
    currentProblem.starterCode.cpp || ""
  );
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isSubmitExecuting, setIsSubmitExecuting] = useState<boolean>(false);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(
    null
  );

  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [showProblem, setShowProblem] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("editor");
  const { toast } = useToast();
  const isMobile = useMobile();

  // Add ref for test results section to scroll to after execution
  const testResultsRef = useRef<HTMLDivElement>(null);

  // Update code when problem changes
  useEffect(() => {
    if (
      currentProblem &&
      currentProblem.starterCode &&
      currentProblem.starterCode[language]
    ) {
      setCode(currentProblem.starterCode[language]);
    }
  }, [currentProblem, language]);

  // Set initial showProblem state based on screen size
  useEffect(() => {
    setShowProblem(!isMobile);
  }, [isMobile]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (currentProblem.starterCode && currentProblem.starterCode[newLanguage]) {
      setCode(currentProblem.starterCode[newLanguage]);
    } else {
      // Default empty templates if no starter code is available
      const defaultTemplates: Record<string, string> = {
        java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // Read input and solve the problem
        
        // Output the result
    }
}`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Read input and solve the problem
    
    // Output the result
    
    return 0;
}`,
        python: `# Read input and solve the problem

# Output the result
`,
      };
      setCode(defaultTemplates[newLanguage] || "");
    }
    setResults(null);
  };

  const handleFormatCode = async () => {
    setIsFormatting(true);
    try {
      const formattedCode = await formatCode(code, language);
      setCode(formattedCode);
      toast({
        title: "Code formatted",
        description: "Your code has been formatted successfully.",
      });
    } catch (error) {
      toast({
        title: "Formatting Error",
        description:
          error instanceof Error ? error.message : "Failed to format code",
        variant: "destructive",
      });
    } finally {
      setIsFormatting(false);
    }
  };

  // Add keyboard shortcut for formatting (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleFormatCode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [code, language]);

  // Function to scroll to test results section
  const scrollToResults = () => {
    if (testResultsRef.current) {
      // Slight delay to ensure the DOM is updated
      setTimeout(() => {
        testResultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const runCode = async () => {
    setIsExecuting(true);
    setResults(null);
    setActiveTab("results");

    console.log("Running code...");
    console.log("Code:", code);
    console.log("Language:", language);
    console.log("Test Cases:", currentProblem.testCases);

    try {
      const executionResults = await executeCode(
        code,
        language,
        currentProblem.testCases
      );

      // Mark visible test cases
      const resultsWithVisibility = executionResults.map((result) => ({
        ...result,
        isHidden: false,
      }));

      setResults(resultsWithVisibility);

      // Scroll to results after execution completes
      scrollToResults();
    } catch (error) {
      console.error("Error executing code:", error);
      toast({
        title: "Execution Error",
        description:
          error instanceof Error ? error.message : "Failed to execute code",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const submitCode = async () => {
    setIsSubmitExecuting(true);
    setResults(null);
    setActiveTab("results");

    try {
      // Create submission in database
      const submission = await createSubmission(
        currentProblem.id,
        code,
        language as "cpp" | "java" | "python"
      );
      console.log("Submission created:", submission);
      // Set current submission ID for tracking

      setCurrentSubmissionId(submission.id);

      toast({
        title: "Submission created",
        description: "Your code has been submitted for evaluation.",
      });

      // Combine visible and hidden test cases for submission
      const allTestCases = [
        ...currentProblem.testCases,
        ...currentProblem.hiddenTestCases,
      ];

      // Execute submission and update database
      const submissionResult = await executeSubmission(
        submission.id,
        allTestCases
      );

      // Get execution results for display
      const executionResults = await executeCode(code, language, allTestCases);

      // Mark which test cases are visible vs hidden
      const visibleCount = currentProblem.testCases.length;
      const resultsWithVisibility = executionResults.map((result, index) => ({
        ...result,
        isHidden: index >= visibleCount,
      }));

      setResults(resultsWithVisibility);

      // Check if all test cases passed
      const allPassed = submissionResult.status === "accepted";

      toast({
        title: allPassed
          ? "All tests passed!"
          : `Submission ${submissionResult.status}`,
        description: allPassed
          ? "Congratulations! Your solution passed all test cases."
          : submissionResult.errorMessage ||
            "Your solution didn't pass all test cases. Please review and try again.",
        variant: allPassed ? "default" : "destructive",
      });

      // Scroll to results after submission completes
      scrollToResults();
    } catch (error) {
      console.error("Error submitting code:", error);
      toast({
        title: "Submission Error",
        description:
          error instanceof Error ? error.message : "Failed to submit code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitExecuting(false);
    }
  };

  const toggleProblemView = () => {
    setShowProblem(!showProblem);
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-2 md:p-4 border-b">
        <h1 className="text-xl md:text-2xl font-bold">
          Competitive Coding Platform
        </h1>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>

      <div className="flex-grow overflow-auto px-2 md:px-4 pb-2 md:pb-4">
        {/* Mobile toggle for problem view */}
        <div className="lg:hidden w-full flex justify-end mb-2">
          <Button
            variant="outline"
            onClick={toggleProblemView}
            className="flex items-center gap-1"
          >
            {showProblem ? (
              <>
                <span>Hide Problem</span>
                <ChevronLeft className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Show Problem</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Main content area - scrollable */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-full p-2">
          {/* Problem description panel */}
          {showProblem && (
            <div className="lg:col-span-4 space-y-4">
              <Card className="p-0 overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Problem Description</h3>
                  </div>
                </div>
                <ProblemDescription problem={currentProblem} />
              </Card>

              {/* Submission History */}
              <SubmissionHistory problemId={currentProblem.id} />
            </div>
          )}

          {/* Editor and test results panel */}
          <div
            className={`${showProblem ? "lg:col-span-8" : "col-span-12"} flex flex-col gap-4`}
          >
            {/* Code Editor Card */}
            <Card className="p-0 flex flex-col min-h-[60vh] overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <LayoutPanelLeft className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Code Editor</h3>
                  <Select
                    defaultValue={language}
                    onValueChange={handleLanguageChange}
                    value={language}
                  >
                    <SelectTrigger className="w-[140px] md:w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFormatCode}
                    disabled={isFormatting}
                    title="Format Code (Ctrl+S / Cmd+S)"
                    className="h-8 cursor-pointer"
                  >
                    {isFormatting ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <FileCode className="h-3 w-3 mr-1" />
                    )}
                    Format
                  </Button>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={runCode}
                    disabled={isExecuting || isFormatting}
                    className="flex-1 sm:flex-none h-8 cursor-pointer"
                  >
                    {isExecuting ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Play className="mr-1 h-3 w-3" />
                    )}
                    Run
                  </Button>
                  <Button
                    size="sm"
                    onClick={submitCode}
                    disabled={isSubmitExecuting || isFormatting}
                    className="flex-1 sm:flex-none h-8 text-white cursor-pointer"
                  >
                    {isSubmitExecuting ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="mr-1 h-3 w-3" />
                    )}
                    Submit
                  </Button>
                </div>
              </div>

              {/* Mobile tabs for editor and results */}
              <div className="lg:hidden">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger
                      value="editor"
                      className="flex items-center gap-1"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger
                      value="results"
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Results
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="editor" className="m-0 p-0">
                    <div className="h-[calc(100vh-300px)]">
                      <CodeEditor
                        code={code}
                        language={language}
                        onChange={setCode}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="results" className="m-0 p-0">
                    <div className="p-4 h-[calc(100vh-300px)] overflow-auto">
                      <TestResults
                        results={results}
                        isLoading={isExecuting || isSubmitExecuting}
                        language={language}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Desktop layout for editor and results */}
              <div className="hidden lg:flex flex-col flex-grow">
                <div className="flex-grow overflow-hidden">
                  <CodeEditor
                    code={code}
                    language={language}
                    onChange={setCode}
                  />
                </div>

                {/* Test Results Card with ref for scrolling */}
                <div ref={testResultsRef} className="scroll-mt-4 border-t p-4">
                  <div className="p-4 max-h-full overflow-hidden">
                    <TestResults
                      results={results}
                      isLoading={isExecuting || isSubmitExecuting}
                      language={language}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
