"use client";

import { useState } from "react";
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
import { toast } from "sonner";

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
  problemId: string | null;
  onSubmit?: () => void;
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
  problemId,
  onSubmit,
}: HintsConstraintsTabProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Ensure we have at least one constraint and hint
  if (constraints.length === 0) {
    addConstraint();
  }

  if (hints.length === 0) {
    addHint();
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving hints and constraints...");
    console.log("Constraints:", constraints);
    console.log("Hints:", hints);
    if (!problemId) {
      toast.error("Error", {
        description: "Problem ID is required to save hints and constraints",
      });
      return;
    }

    setIsSaving(true);
    let hasError = false;

    try {
      // Save all non-empty constraints to the database
      for (let i = 0; i < constraints.length; i++) {
        const constraint = constraints[i].trim();
        if (!constraint) continue; // Skip empty constraints

        const response = await fetch("/api/constraints", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            problemId,
            content: constraint,
            order: i,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to save constraint ${i + 1}`
          );
        }
      }

      // Save all non-empty hints to the database
      for (let i = 0; i < hints.length; i++) {
        const hint = hints[i].trim();
        if (!hint) continue; // Skip empty hints

        const response = await fetch("/api/hints", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            problemId,
            content: hint,
            order: i,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to save hint ${i + 1}`);
        }
      }

      toast.success("Success", {
        description: "Hints and constraints saved successfully",
      });

      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error("Error saving hints or constraints:", error);
      hasError = true;
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to save hints or constraints",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
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
                  onChange={(e) =>
                    handleConstraintChange(index, e.target.value)
                  }
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
          <Button type="submit" disabled={isLoading || isSaving || !problemId}>
            {isLoading || isSaving ? "Saving..." : "Create Problem"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
