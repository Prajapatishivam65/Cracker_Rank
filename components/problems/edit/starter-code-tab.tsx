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
import { toast } from "sonner";
import type { StarterCode } from "@/hooks/use-problem-form";
import { updateProblemStarterCode } from "@/actions/problem-actions";

interface StarterCodeTabProps {
  starterCode: StarterCode;
  handleStarterCodeChange: (language: string, code: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  problemId: string;
}

export default function StarterCodeTab({
  starterCode,
  handleStarterCodeChange,
  onPrevious,
  onNext,
  problemId,
}: StarterCodeTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateStarterCode = async () => {
    if (!problemId) {
      toast.error("Problem ID missing", {
        description: "Cannot update starter code without a valid problem ID.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const starterCodeData = Object.entries(starterCode)
        .filter(([_, code]) => code.trim() !== "")
        .map(([language, code]) => ({
          language,
          code,
        }));

      const result = await updateProblemStarterCode(problemId, starterCodeData);

      if (!result.success) {
        throw new Error(result.error || "Failed to update starter code");
      }

      toast.success("Starter code updated", {
        description: "You can now continue to edit test cases.",
      });

      onNext();
    } catch (error) {
      console.error("Error updating starter code:", error);
      toast.error("Error updating starter code", {
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
        <CardTitle>Starter Code</CardTitle>
        <CardDescription>
          Update starter code templates for different languages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cpp-code">C++</Label>
            <Textarea
              id="cpp-code"
              rows={10}
              placeholder="C++ starter code"
              value={starterCode.cpp}
              onChange={(e) => handleStarterCodeChange("cpp", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="java-code">Java</Label>
            <Textarea
              id="java-code"
              rows={10}
              placeholder="Java starter code"
              value={starterCode.java}
              onChange={(e) => handleStarterCodeChange("java", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="python-code">Python</Label>
            <Textarea
              id="python-code"
              rows={10}
              placeholder="Python starter code"
              value={starterCode.python}
              onChange={(e) =>
                handleStarterCodeChange("python", e.target.value)
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between space-x-2">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous: Examples
        </Button>
        <Button
          type="button"
          onClick={handleUpdateStarterCode}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save & Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
