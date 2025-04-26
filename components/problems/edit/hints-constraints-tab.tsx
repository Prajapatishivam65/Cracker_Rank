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
import {
  updateProblemConstraints,
  updateProblemHints,
} from "@/actions/problem-actions";

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
  problemId: string;
  contestId?: string;
  onSubmit: () => Promise<void>;
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

  const handleUpdateHintsAndConstraints = async () => {
    if (!problemId) {
      toast.error("Problem ID missing", {
        description:
          "Cannot update hints and constraints without a valid problem ID.",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Update constraints
      const constraintsData = constraints
        .filter((constraint) => constraint.trim() !== "")
        .map((content, index) => ({
          content,
          order: index,
        }));

      const constraintsResult = await updateProblemConstraints(
        problemId,
        constraintsData
      );

      if (!constraintsResult.success) {
        throw new Error(
          constraintsResult.error || "Failed to update constraints"
        );
      }

      // Update hints
      const hintsData = hints
        .filter((hint) => hint.trim() !== "")
        .map((content, index) => ({
          content,
          order: index,
        }));

      const hintsResult = await updateProblemHints(problemId, hintsData);

      if (!hintsResult.success) {
        throw new Error(hintsResult.error || "Failed to update hints");
      }

      toast.success("Success", {
        description: "Problem updated successfully",
      });

      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit();
      }

      // Redirect to the problem view page
      router.push(`/admin/problems/${problemId}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating hints or constraints:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update hints or constraints",
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
          Update constraints and optional hints for the problem.
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
          className="text-white"
          onClick={handleUpdateHintsAndConstraints}
          disabled={isLoading || isSaving || !problemId}
        >
          {isLoading || isSaving ? "Saving..." : "Update Problem"}
        </Button>
      </CardFooter>
    </Card>
  );
}
