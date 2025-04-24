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
import { useRouter } from "next/navigation";

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
  contestId: string | null;
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
  contestId,
  onSubmit,
}: HintsConstraintsTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  // Ensure we have at least one constraint and hint
  if (constraints.length === 0) {
    addConstraint();
  }

  if (hints.length === 0) {
    addHint();
  }

  const handleSaveHintsAndConstraints = async () => {
    if (!problemId) {
      toast.error("Problem ID missing", {
        description: "Please save the problem details first.",
      });
      return;
    }

    console.log("Saving hints and constraints...");
    console.log("Problem ID:", problemId);
    console.log("Constraints:", constraints);
    console.log("Hints:", hints);

    setIsSaving(true);

    try {
      // Save all non-empty constraints to the database
      console.log("Saving constraints");
      const constraintPromises = constraints
        .filter((constraint) => constraint.trim() !== "")
        .map(async (constraint, index) => {
          console.log(`Sending constraint ${index} to API:`, constraint);
          return fetch("/api/constraints", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              problemId,
              content: constraint,
              order: index,
            }),
          });
        });

      await Promise.all(constraintPromises);
      console.log(`Saved ${constraintPromises.length} constraints`);

      // Save all non-empty hints to the database
      console.log("Saving hints");
      const hintPromises = hints
        .filter((hint) => hint.trim() !== "")
        .map(async (hint, index) => {
          console.log(`Sending hint ${index} to API:`, hint);
          return fetch("/api/hints", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              problemId,
              content: hint,
              order: index,
            }),
          });
        });

      await Promise.all(hintPromises);
      console.log(`Saved ${hintPromises.length} hints`);

      toast.success("Success", {
        description: "Hints and constraints saved successfully",
      });

      // Call the onSubmit callback if provided
      if (onSubmit) {
        console.log("Calling onSubmit callback...");
        onSubmit();
      }

      // Optionally, you can redirect or perform other actions here
      // For example, redirecting to the problem details page
      router.push(`/admin/contests/${contestId}`);
    } catch (error) {
      console.error("Error saving hints or constraints:", error);
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
        <Button
          type="button"
          onClick={handleSaveHintsAndConstraints}
          disabled={isLoading || isSaving || !problemId}
        >
          {isLoading || isSaving ? "Saving..." : "Create Problem"}
        </Button>
      </CardFooter>
    </Card>
  );
}
