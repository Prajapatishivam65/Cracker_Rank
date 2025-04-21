"use client";

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
import type { Example } from "@/hooks/use-problem-form";

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
}

export default function ExamplesTab({
  examples,
  handleExampleChange,
  addExample,
  removeExample,
  onPrevious,
  onNext,
}: ExamplesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Examples</CardTitle>
        <CardDescription>
          Add sample inputs, outputs, and explanations for the problem.
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
        <Button type="button" onClick={onNext}>
          Next: Starter Code
        </Button>
      </CardFooter>
    </Card>
  );
}
