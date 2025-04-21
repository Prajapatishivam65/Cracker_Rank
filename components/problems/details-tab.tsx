"use client";

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
import type { Problem } from "@/hooks/use-problem-form";

interface DetailsTabProps {
  problem: Problem;
  handleInputChange: (field: keyof Problem, value: any) => void;
  onNext: () => void;
}

export default function DetailsTab({
  problem,
  handleInputChange,
  onNext,
}: DetailsTabProps) {
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
        <Button type="button" onClick={onNext}>
          Next: Examples
        </Button>
      </CardFooter>
    </Card>
  );
}
