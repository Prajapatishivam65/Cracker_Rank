"use client";

import { useState } from "react";
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
import { db } from "@/drizzle/db";
import { problems } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

interface DetailsTabProps {
  problem: Problem;
  handleInputChange: (field: keyof Problem, value: any) => void;
  onNext: () => void;
  contestId: string;
  userId: string;
  setProblemId: (id: string) => void;
  isEditMode?: boolean;
  problemId?: string;
}

export default function DetailsTab({
  problem,
  handleInputChange,
  onNext,
  contestId,
  setProblemId,
  userId,
  isEditMode = false,
  problemId,
}: DetailsTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveDetails = async () => {
    if (!problem.title || !problem.description) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields before continuing.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && problemId) {
        // Update existing problem
        await db
          .update(problems)
          .set({
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty?.toLowerCase() as
              | "easy"
              | "medium"
              | "hard",
            timeLimit: problem.timeLimit || "1 second",
            memoryLimit: problem.memoryLimit || "256 megabytes",
            updatedAt: new Date(),
          })
          .where(eq(problems.id, problemId));

        toast.success("Problem details updated", {
          description: "Problem details have been successfully updated.",
        });
      } else {
        // Create new problem (original logic)
        console.log("Creating main problem record");
        console.log("contest id", contestId);
        console.log("problem", problem);

        const problemResponse = await fetch("/api/problems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contestId,
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty?.toLowerCase(),
            timeLimit: problem.timeLimit || "1 second",
            memoryLimit: problem.memoryLimit || "256 megabytes",
            order: 0,
            createdBy: userId,
          }),
        });

        if (!problemResponse.ok) {
          const errorData = await problemResponse.json();
          throw new Error(
            errorData?.error ||
              `Failed to create problem: ${problemResponse.statusText}`
          );
        }

        const problemData = await problemResponse.json();
        const newProblemId = problemData.id;
        console.log(`Created problem with ID: ${newProblemId}`);

        setProblemId(newProblemId);

        toast.success("Problem details saved", {
          description: "You can now add examples to your problem.",
        });
      }

      onNext();
    } catch (error) {
      console.error("Error saving problem details:", error);
      toast.error("Error saving problem details", {
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
        <CardTitle>Problem Details</CardTitle>
        <CardDescription>
          Define the problem statement and basic information.
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
          onClick={handleSaveDetails}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update & Continue"
            : "Save & Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
