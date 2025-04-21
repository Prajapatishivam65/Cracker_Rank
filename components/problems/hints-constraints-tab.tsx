"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface HintsConstraintsTabProps {
  constraints: string[];
  hints: string[];
  handleConstraintChange: (index: number, value: string) => void;
  handleHintChange: (index: number, value: string) => void;
  addConstraint: () => void;
  removeConstraint: (index: number) => void;
  addHint: () => void;
  removeHint: (index: number) => void;
  onPrevious: () => void;
  isLoading: boolean;
  problemId: string | null; // Added missing prop
}

export default function HintsConstraintsTab({
  constraints,
  hints,
  handleConstraintChange,
  handleHintChange,
  addConstraint,
  removeConstraint,
  addHint,
  removeHint,
  onPrevious,
  isLoading,
  problemId, // Added the missing prop
}: HintsConstraintsTabProps) {
  // Ensure we have at least one constraint and hint
  if (constraints.length === 0) {
    addConstraint();
  }

  if (hints.length === 0) {
    addHint();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hints & Constraints</CardTitle>
        <CardDescription>
          Add constraints and optional hints for the problem.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CONSTRAINTS */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Constraints</h3>
          {constraints.map((constraint, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={constraint}
                placeholder="e.g., 1 ≤ N ≤ 10^5"
                onChange={(e) => handleConstraintChange(index, e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeConstraint(index)}
                disabled={constraints.length <= 1}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addConstraint}>
            Add Constraint
          </Button>
        </div>
        {/* HINTS */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Hints (Optional)</h3>
          {hints.map((hint, index) => (
            <div key={index} className="flex items-center gap-2">
              <Textarea
                rows={2}
                value={hint}
                placeholder="Add a helpful hint"
                onChange={(e) => handleHintChange(index, e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeHint(index)}
                disabled={hints.length <= 1}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addHint}>
            Add Hint
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between space-x-2">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous: Test Cases
        </Button>
        <Button type="submit" disabled={isLoading || !problemId}>
          {isLoading ? "Creating..." : "Create Problem"}
        </Button>
      </CardFooter>
    </Card>
  );
}
