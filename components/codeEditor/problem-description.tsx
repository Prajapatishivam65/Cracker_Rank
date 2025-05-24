import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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
  timeLimit?: string;
  memoryLimit?: string;
}

interface ProblemDescriptionProps {
  problem: Problem;
}

export default function ProblemDescription({
  problem,
}: ProblemDescriptionProps) {
  // Map difficulty to color
  const difficultyColor =
    {
      Easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
      Medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
      Hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    }[problem.difficulty] ||
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";

  // Function to format text with code blocks and math notation
  const formatText = (text: string) => {
    return text
      .replace(
        /`([^`]+)`/g,
        "<code class='px-1 py-0.5 bg-muted rounded text-xs font-mono'>$1</code>"
      )
      .replace(/\$\$(.*?)\$\$/g, "<span class='math-formula'>$1</span>") // Basic math notation support
      .replace(/\n/g, "<br />");
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Problem Title and Difficulty */}
      <div className="pb-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <h2 className="text-xl font-bold">{problem.title}</h2>
          <Badge
            className={cn(difficultyColor, "font-medium px-2 py-1 self-start")}
          >
            {problem.difficulty}
          </Badge>
        </div>
        {(problem.timeLimit || problem.memoryLimit) && (
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
            {problem.timeLimit && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Time Limit:</span>{" "}
                {problem.timeLimit}
              </div>
            )}
            {problem.memoryLimit && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Memory Limit:</span>{" "}
                {problem.memoryLimit}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Problem Description */}
      <div className="prose dark:prose-invert max-w-none">
        <div
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: formatText(problem.description),
          }}
        />
      </div>

      {/* Constraints */}
      <div className="pb-3">
        <h3 className="text-lg font-semibold mb-2 pb-1 border-b">
          Constraints
        </h3>
        <ul className="list-disc list-inside space-y-1.5 text-sm">
          {problem.constraints.map((constraint, index) => (
            <li
              key={index}
              dangerouslySetInnerHTML={{
                __html: formatText(constraint),
              }}
            />
          ))}
        </ul>
      </div>

      {/* Examples */}
      <div className="pb-3">
        <h3 className="text-lg font-semibold mb-2 pb-1 border-b">Examples</h3>
        <div className="space-y-4">
          {problem.examples.map((example, index) => (
            <div
              key={index}
              className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="bg-muted/50 px-3 py-1.5 text-xs font-medium border-b flex justify-between items-center">
                <span>Example {index + 1}</span>
              </div>
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Input */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1"></span>
                      Input:
                    </h4>
                    <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                      {example.input}
                    </pre>
                  </div>
                  {/* Output */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                      Output:
                    </h4>
                    <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                      {example.output}
                    </pre>
                  </div>
                </div>
                {/* Explanation */}
                {example.explanation && (
                  <div className="space-y-1 pt-1 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mr-1"></span>
                      Explanation:
                    </h4>
                    <p
                      className="text-xs"
                      dangerouslySetInnerHTML={{
                        __html: formatText(example.explanation),
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hints */}
      {problem.hints && problem.hints.length > 0 && (
        <Accordion type="single" collapsible className="border-t pt-2">
          <AccordionItem value="hints" className="border-none">
            <AccordionTrigger className="text-lg font-semibold py-2 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                Hints
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-2 pl-2">
                {problem.hints.map((hint, index) => (
                  <li key={index} className="text-sm">
                    {hint}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Additional resources section */}
      <div className="text-xs text-muted-foreground border-t pt-3 mt-4">
        <p>
          Need help? Check out the{" "}
          <a href="#" className="text-primary hover:underline">
            discussion forum
          </a>{" "}
          or{" "}
          <a href="#" className="text-primary hover:underline">
            related problems
          </a>
          .
        </p>
      </div>
    </div>
  );
}
