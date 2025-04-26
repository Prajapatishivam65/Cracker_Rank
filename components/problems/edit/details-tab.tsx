"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import type { Problem } from "@/hooks/use-problem-form";
import {
  updateProblemDetails,
  getProblemDetails,
} from "@/actions/problem-actions";

interface DetailsTabProps {
  problem: Problem;
  handleInputChange: (field: keyof Problem, value: any) => void;
  onNext: () => void;
  contestId?: string;
  userId: string;
  problemId: string;
}

export default function DetailsTab({
  problem,
  handleInputChange,
  onNext,
  contestId,
  userId,
  problemId,
}: DetailsTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing problem data when component mounts
  useEffect(() => {
    async function loadProblemData() {
      setIsLoading(true);
      try {
        const existingProblem = await getProblemDetails(problemId);

        if (existingProblem) {
          // Update each field with the existing data
          handleInputChange("title", existingProblem.title);
          handleInputChange("description", existingProblem.description);
          handleInputChange("difficulty", existingProblem.difficulty);
          handleInputChange("timeLimit", existingProblem.timeLimit);
          handleInputChange("memoryLimit", existingProblem.memoryLimit);
        }
      } catch (error) {
        console.error("Failed to load existing problem data:", error);
        toast.error("Failed to load problem data", {
          description: "Please try refreshing the page.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (problemId) {
      loadProblemData();
    } else {
      setIsLoading(false);
    }
  }, [problemId, handleInputChange]);

  const handleUpdateDetails = async () => {
    if (!problem.title || !problem.description) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields before continuing.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProblemDetails(problemId, {
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        timeLimit: problem.timeLimit || "1 second",
        memoryLimit: problem.memoryLimit || "256 megabytes",
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update problem details");
      }

      toast.success("Problem details updated", {
        description: "You can now continue to edit examples.",
      });

      onNext();
    } catch (error) {
      console.error("Error updating problem details:", error);
      toast.error("Error updating problem details", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Problem Details</CardTitle>
          <CardDescription>Loading existing problem data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Problem Details</CardTitle>
        <CardDescription>
          Update the problem statement and basic information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Problem Title</Label>
          <Input
            id="title"
            placeholder="e.g., Remove the Blockers!"
            value={problem.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <select
            id="difficulty"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={problem.difficulty}
            onChange={(e) => handleInputChange("difficulty", e.target.value)}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Problem Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the problem in detail... Markdown is supported."
            rows={12}
            value={problem.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time Limit</Label>
            <Input
              id="timeLimit"
              placeholder="e.g., 1 second"
              value={problem.timeLimit}
              onChange={(e) => handleInputChange("timeLimit", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memoryLimit">Memory Limit</Label>
            <Input
              id="memoryLimit"
              placeholder="e.g., 256 megabytes"
              value={problem.memoryLimit}
              onChange={(e) => handleInputChange("memoryLimit", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          type="button"
          onClick={handleUpdateDetails}
          disabled={isSubmitting}
          className="text-white"
        >
          {isSubmitting ? "Saving..." : "Save & Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
