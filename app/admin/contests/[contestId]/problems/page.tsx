"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NewProblemPage({
  params,
}: {
  params: { contestId: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    // In a real app, you would submit to your backend
    // For demo purposes, we'll just redirect back to the contest page
    setTimeout(() => {
      router.push(`/admin/contests/${params.contestId}`);
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold">Add New Problem</h1>
      <p className="mb-6 text-gray-600">
        Creating problem for Contest ID: {params.contestId}
      </p>

      <form onSubmit={onSubmit}>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Problem Details</TabsTrigger>
            <TabsTrigger value="testcases">Test Cases</TabsTrigger>
            <TabsTrigger value="constraints">Constraints</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
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
                  <Input id="title" placeholder="e.g., Two Sum" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <select
                    id="difficulty"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue="medium"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statement">Problem Statement</Label>
                  <Textarea
                    id="statement"
                    placeholder="Describe the problem in detail..."
                    rows={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inputFormat">Input Format</Label>
                  <Textarea
                    id="inputFormat"
                    placeholder="Describe the input format..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outputFormat">Output Format</Label>
                  <Textarea
                    id="outputFormat"
                    placeholder="Describe the expected output format..."
                    rows={3}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testcases" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Cases</CardTitle>
                <CardDescription>
                  Add sample and hidden test cases for the problem.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Sample Test Cases</h3>
                  <div className="rounded-md border p-4">
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sampleInput1">Sample Input 1</Label>
                        <Textarea
                          id="sampleInput1"
                          rows={3}
                          placeholder="[2, 7, 11, 15]&#10;9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sampleOutput1">Sample Output 1</Label>
                        <Textarea
                          id="sampleOutput1"
                          rows={3}
                          placeholder="[0, 1]"
                        />
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      Add Another Sample
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hidden Test Cases</h3>
                  <div className="rounded-md border p-4">
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hiddenInput1">Test Input 1</Label>
                        <Textarea id="hiddenInput1" rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hiddenOutput1">Expected Output 1</Label>
                        <Textarea id="hiddenOutput1" rows={3} />
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      Add Another Test Case
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="constraints" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Constraints</CardTitle>
                <CardDescription>
                  Set time and memory limits, and other constraints.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="0.1"
                      step="0.1"
                      defaultValue="1.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memoryLimit">Memory Limit (MB)</Label>
                    <Input
                      id="memoryLimit"
                      type="number"
                      min="1"
                      defaultValue="256"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constraints">Input Constraints</Label>
                  <Textarea
                    id="constraints"
                    placeholder="e.g., 1 <= nums.length <= 10^5&#10;-10^9 <= nums[i] <= 10^9"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowedLanguages">Allowed Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Python", "Java", "C++", "JavaScript", "Go", "Rust"].map(
                      (lang) => (
                        <label
                          key={lang}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span>{lang}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Problem"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
