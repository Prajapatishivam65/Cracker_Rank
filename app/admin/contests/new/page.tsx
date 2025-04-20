"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function NewContestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isPublic, setIsPublic] = useState(true);
  const [securityCode, setSecurityCode] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    // Prepare contest data for submission
    const formData = new FormData(event.currentTarget);

    const contestData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      startDate: startDate,
      endDate: endDate,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      problemCount: parseInt(formData.get("problemCount") as string),
      isPublic: isPublic,
      securityCode: isPublic ? null : securityCode,
    };

    // In a real app, you would submit to your backend
    console.log("Contest data to submit:", contestData);

    // For demo purposes, we'll just redirect back to the contests page
    setTimeout(() => {
      router.push("/admin/contests");
      setIsLoading(false);
    }, 1000);
  }

  const handleVisibilityChange = (value: string) => {
    setIsPublic(value === "public");
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Contest
        </h1>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="hidden sm:flex"
        >
          Back to Contests
        </Button>
      </div>

      <Card className="border shadow-md">
        <form onSubmit={onSubmit}>
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="text-xl">Contest Details</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Fill in the details for your new coding contest.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="title" className="font-medium">
                        Contest Title
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            Give your contest a clear, descriptive name
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Weekly Challenge #43"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe what the contest is about..."
                      rows={4}
                      required
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Scheduling Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Scheduling</h3>
                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-medium">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              Pick a date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              Pick a date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="font-medium">
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="font-medium">
                      End Time
                    </Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Contest Configuration */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Contest Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="problemCount" className="font-medium">
                      Number of Problems
                    </Label>
                    <Input
                      id="problemCount"
                      name="problemCount"
                      type="number"
                      min="1"
                      placeholder="e.g., 5"
                      defaultValue="5"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contestVisibility" className="font-medium">
                      Contest Visibility
                    </Label>
                    <Select
                      defaultValue="public"
                      onValueChange={handleVisibilityChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Security Code Field - Only shown when Private is selected */}
                {!isPublic && (
                  <div className="mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="securityCode" className="font-medium">
                          Security Code
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              Participants will need this code to join the
                              private contest
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="securityCode"
                        name="securityCode"
                        placeholder="Enter security code for private contest"
                        required={!isPublic}
                        value={securityCode}
                        onChange={(e) => setSecurityCode(e.target.value)}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Share this code only with intended participants. They
                        will need it to join the contest.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-end border-t bg-muted/30 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              className="w-full sm:w-auto bg-primary text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Contest...
                </>
              ) : (
                "Create Contest"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
