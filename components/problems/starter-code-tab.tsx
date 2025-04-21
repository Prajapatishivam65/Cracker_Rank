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
import type { StarterCode } from "@/hooks/use-problem-form";

interface StarterCodeTabProps {
  starterCode: StarterCode;
  handleStarterCodeChange: (language: string, code: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function StarterCodeTab({
  starterCode,
  handleStarterCodeChange,
  onPrevious,
  onNext,
}: StarterCodeTabProps) {
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
        <Button type="button" onClick={onNext}>
          Next: Test Cases
        </Button>
      </CardFooter>
    </Card>
  );
}
