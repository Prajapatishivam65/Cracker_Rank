"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import type { Example } from "@/hooks/use-problem-form";
import { updateProblemExamples } from "@/actions/problem-actions";

interface ExamplesTabProps {
  examples: Example[];
  handleExampleChange: (
    index: number,
    field: keyof Example,
    value: string
  ) => void;
  addExample: () => void;
  removeExample: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  problemId: string;
}

export default function ExamplesTab({
  examples,
  handleExampleChange,
  addExample,
  removeExample,
  onPrevious,
  onNext,
  problemId,
}: ExamplesTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateExamples = async () => {
    if (!problemId) {
      toast.error("Problem ID missing", {
        description: "Cannot update examples without a valid problem ID.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const validExamples = examples.filter(
        (example) => example.input.trim() !== "" && example.output.trim() !== ""
      );

      if (validExamples.length === 0) {
        toast.error("No valid examples", {
          description: "Please add at least one example with input and output.",
        });
        setIsSubmitting(false);
        return;
      }

      const result = await updateProblemExamples(problemId, validExamples);

      if (!result.success) {
        throw new Error(result.error || "Failed to update examples");
      }

      toast.success("Examples updated", {
        description: "You can now continue to edit starter code.",
      });

      onNext();
    } catch (error) {
      console.error("Error updating examples:", error);
      toast.error("Error updating examples", {
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
        <CardTitle>Examples</CardTitle>
        <CardDescription>
          Update sample inputs, outputs, and explanations for the problem.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {examples.map((example, index) => (
          <div key={index} className="rounded-md border p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-medium">Example {index + 1}</h3>
              {examples.length > 1 && (
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
                <Label htmlFor={`example-output-${index}`}>Output</Label>
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
                    handleExampleChange(index, "explanation", e.target.value)
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
      <CardFooter className="flex justify-between space-x-2">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous: Details
        </Button>
        <Button
          type="button"
          onClick={handleUpdateExamples}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save & Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
