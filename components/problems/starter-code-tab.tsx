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

interface StarterCodeTabProps {
  starterCode: StarterCode;
  handleStarterCodeChange: (language: string, code: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  problemId: string | null;
}

export default function StarterCodeTab({
  starterCode,
  handleStarterCodeChange,
  onPrevious,
  onNext,
  problemId,
}: StarterCodeTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveStarterCode = async () => {
    if (!problemId) {
      toast.error("Problem ID missing", {
        description: "Please save the problem details first.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Save starter code for each language
      console.log("Saving starter code templates");
      const starterCodePromises = Object.entries(starterCode)
        .filter(([_, code]) => code.trim() !== "")
        .map(async ([language, code]) => {
          return fetch("/api/starter-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              problemId,
              language, // language is already lowercase (cpp, java, python)
              code,
            }),
          });
        });

      await Promise.all(starterCodePromises);
      console.log(
        `Saved starter code for ${starterCodePromises.length} languages`
      );

      toast.success("Starter code saved", {
        description: "You can now add test cases to your problem.",
      });

      onNext();
    } catch (error) {
      console.error("Error saving starter code:", error);
      toast.error("Error saving starter code", {
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
          Provide starter code templates for different languages.
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
          onClick={handleSaveStarterCode}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save & Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
