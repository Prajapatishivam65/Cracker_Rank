import { Check, X, AlertCircle, Eye, EyeOff } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface TestResult {
  testCaseIndex: number;
  input: any[];
  expectedOutput: string;
  actualOutput: string | null;
  error: string | null;
  passed: boolean;
  isHidden?: boolean;
}

interface TestResultsProps {
  results: TestResult[] | null;
  isLoading: boolean;
  language: string;
}

export default function TestResults({
  results,
  isLoading,
  language,
}: TestResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
          <span className="text-sm text-muted-foreground">
            Executing your code...
          </span>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <AlertCircle className="mb-2 h-8 w-8" />
        <p>Run your code to see results</p>
      </div>
    );
  }

  const passedCount = results.filter((result) => result.passed).length;
  const totalCount = results.length;
  const visibleResults = results.filter((result) => !result.isHidden);
  const hiddenResults = results.filter((result) => result.isHidden);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Test Results</h3>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium",
              passedCount === totalCount
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
            )}
          >
            {passedCount === totalCount ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            {passedCount}/{totalCount} passed
          </span>
        </div>
      </div>

      {visibleResults.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Visible Test Cases</h4>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {visibleResults.map((result, index) => (
              <TestResultItem
                key={index}
                result={result}
                index={index}
                language={language}
              />
            ))}
          </Accordion>
        </>
      )}

      {hiddenResults.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-6">
            <EyeOff className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Hidden Test Cases</h4>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {hiddenResults.map((result, index) => (
              <TestResultItem
                key={index}
                result={result}
                index={visibleResults.length + index}
                language={language}
                isHidden={true}
              />
            ))}
          </Accordion>
        </>
      )}
    </div>
  );
}

function TestResultItem({
  result,
  index,
  language,
  isHidden = false,
}: {
  result: TestResult;
  index: number;
  language: string;
  isHidden?: boolean;
}) {
  return (
    <AccordionItem
      value={`item-${index}`}
      className={cn(
        "border rounded-md shadow-sm transition-all hover:shadow",
        result.passed
          ? "border-green-200 dark:border-green-800/60"
          : "border-red-200 dark:border-red-800/60"
      )}
    >
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {result.passed ? (
              <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center">
                <Check className="h-3.5 w-3.5" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                <X className="h-3.5 w-3.5" />
              </div>
            )}
            <span className="font-medium">Test Case {index + 1}</span>
            {isHidden && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                Hidden
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {result.passed ? "Passed" : "Failed"}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 py-2 space-y-3">
        {/* Input Section */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Input:</h4>
          <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
            {formatInputDisplay(result.input)}
          </pre>
        </div>

        {/* Expected Output Section */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Expected Output:</h4>
          <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
            {result.expectedOutput}
          </pre>
        </div>

        {/* Actual Output Section */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Your Output:</h4>
          <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
            {result.actualOutput || "(No output)"}
          </pre>
        </div>

        {/* Error Section - Only show if there's an error */}
        {result.error && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-red-500">Error:</h4>
            <pre className="text-xs bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
              {result.error}
            </pre>
          </div>
        )}

        {/* Tips for improvement - Only show on failed tests */}
        {!result.passed && !result.error && (
          <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
            <p className="font-medium">Tips:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Check your output format (spaces, newlines, etc.)</li>
              <li>Verify your algorithm handles edge cases</li>
              {language === "cpp" && (
                <li>
                  Make sure you're using correct data types for competitive
                  programming (e.g., long long for large integers)
                </li>
              )}
            </ul>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

// Helper function to format input for display
function formatInputDisplay(input: any): string {
  if (!input) return "(No input)";

  if (Array.isArray(input)) {
    if (input.length === 0) return "[]";

    // Format arrays with more readable output
    return input
      .map((item) => {
        if (Array.isArray(item)) {
          return `[${item.join(", ")}]`;
        } else if (typeof item === "object" && item !== null) {
          return JSON.stringify(item, null, 2);
        } else {
          return String(item);
        }
      })
      .join("\n");
  }

  return String(input);
}
