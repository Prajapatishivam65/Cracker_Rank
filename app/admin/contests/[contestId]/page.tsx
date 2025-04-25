"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Trash2,
  AlertTriangle,
  Globe,
  Lock,
  Loader2,
  User,
  CalendarRange,
  Info,
  Award,
  Edit2,
  BookOpen,
  Code,
  ExternalLink,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm"; // Import drizzle-orm operators for queries
import { db } from "@/drizzle/db";
import {
  contests,
  UserTable,
  problems as problemsTable,
} from "@/drizzle/schema";

// Define the Contest type based on your schema
type Contest = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  status: "draft" | "active" | "completed";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  securityCode: string | null;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
};

// Define the Problem type based on your schema
type Problem = {
  id: string;
  contestId: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: string;
  memoryLimit: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
};

const ContestViewPage = () => {
  const router = useRouter();
  const params = useParams<{ tag: string; item: string }>();
  // const contestId = params.item; // Get the contest ID from the URL
  const contestId = "3e052d58-78da-4f70-9e4e-5b2c2cfde719";
  // Todo params.contestId as string; // Uncomment this line to use dynamic contest ID from URL

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contest, setContest] = useState<Contest | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(true);

  useEffect(() => {
    async function fetchContestDetails() {
      try {
        setIsLoading(true);

        // Fetch contest directly from database using Drizzle ORM
        const contestData = await db.query.contests.findFirst({
          where: eq(contests.id, contestId),
        });

        if (!contestData) {
          throw new Error("Contest not found");
        }

        // Fetch creator information
        const creatorData = await db.query.UserTable.findFirst({
          where: eq(UserTable.id, contestData.createdBy),
          columns: {
            id: true,
            name: true,
            email: true,
          },
        });

        // Set the contest state with creator information
        setContest({
          ...contestData,
          startDate: new Date(contestData.startDate),
          endDate: new Date(contestData.endDate),
          createdAt: new Date(contestData.createdAt),
          updatedAt: new Date(contestData.updatedAt),
          creator: creatorData || undefined,
        });
      } catch (err) {
        console.error("Error fetching contest:", err);
        setError("Failed to load contest. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchProblems() {
      try {
        setLoadingProblems(true);

        // Fetch problems for this contest
        const problemsData = await db.query.problems.findMany({
          where: eq(problemsTable.contestId, contestId),
          orderBy: [problemsTable.order, problemsTable.title],
        });

        setProblems(
          problemsData.map((problem) => ({
            ...problem,
            createdAt: new Date(problem.createdAt),
            updatedAt: new Date(problem.updatedAt),
          }))
        );
      } catch (err) {
        console.error("Error fetching problems:", err);
        // We don't set main error here to avoid blocking the whole page
      } finally {
        setLoadingProblems(false);
      }
    }

    if (contestId) {
      fetchContestDetails();
      fetchProblems();
    }
  }, [contestId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-0">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active
            </span>
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-0">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Draft
            </span>
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-0">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              Completed
            </span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground">Unknown</Badge>
        );
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return (
          <Badge className="bg-green-100 text-green-700 border-0">Easy</Badge>
        );
      case "medium":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-0">Medium</Badge>
        );
      case "hard":
        return <Badge className="bg-red-100 text-red-700 border-0">Hard</Badge>;
      default:
        return (
          <Badge className="bg-muted text-muted-foreground">Unknown</Badge>
        );
    }
  };

  const formatDateWithTime = (date: Date) => {
    return format(date, "MMMM d, yyyy 'at' h:mm a");
  };

  const formatDuration = (startDate: Date, endDate: Date) => {
    // Calculate the difference in milliseconds
    const diffMs = endDate.getTime() - startDate.getTime();

    // Calculate days, hours and minutes
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // Format the duration string
    let durationStr = "";
    if (days > 0) durationStr += `${days} day${days !== 1 ? "s" : ""} `;
    if (hours > 0) durationStr += `${hours} hour${hours !== 1 ? "s" : ""} `;
    if (minutes > 0)
      durationStr += `${minutes} minute${minutes !== 1 ? "s" : ""}`;

    return durationStr.trim();
  };

  const handleAddProblems = () => {
    router.push(`/admin/contests/${contestId}/problems`);
  };

  const handleEditContest = () => {
    router.push(`/admin/contests/${contestId}/edit`);
  };

  const handleDeleteConfirm = () => {
    // Implement delete functionality or show confirmation modal
    console.log("Delete button clicked for contest:", contestId);
  };

  const handleViewProblem = (problemId: string) => {
    router.push(`/admin/problems/${problemId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <Card className="border shadow-md">
          <CardContent className="p-12 flex justify-center items-center">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                Loading contest details...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <Card className="border shadow-md">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium mb-2">Unable to load contest</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Contests
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {contest.title}
            </h1>
            <p className="text-muted-foreground">
              Contest details and configuration
            </p>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(contest.status)}
            <Badge
              variant="outline"
              className={cn(
                "border",
                contest.isPublic
                  ? "bg-teal-50 text-teal-700 border-teal-200"
                  : "bg-purple-50 text-purple-700 border-purple-200"
              )}
            >
              {contest.isPublic ? (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3 w-3" /> Public
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3" /> Private
                </span>
              )}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <div className="space-y-6">
          <TabsContent value="overview" className="space-y-6">
            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle>Contest Information</CardTitle>
                <CardDescription>
                  Summary and general information about this contest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Description</h3>
                    {contest.description ? (
                      <p className="mt-2">{contest.description}</p>
                    ) : (
                      <p className="text-muted-foreground italic mt-2">
                        No description provided
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Schedule</h4>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Start:
                              </span>
                              <span>
                                {formatDateWithTime(contest.startDate)}
                              </span>
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <span className="text-muted-foreground">
                                End:
                              </span>
                              <span>{formatDateWithTime(contest.endDate)}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CalendarRange className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Duration</h4>
                          <p className="mt-1 text-sm">
                            {formatDuration(contest.startDate, contest.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Created By</h4>
                          <div className="mt-1">
                            {contest.creator ? (
                              <div className="text-sm">
                                <p className="font-medium">
                                  {contest.creator.name}
                                </p>
                                <p className="text-muted-foreground">
                                  {contest.creator.email}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                Creator information not available
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Creation Details</h4>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Created:
                              </span>
                              <span>
                                {format(contest.createdAt, "MMMM d, yyyy")}
                              </span>
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Last updated:
                              </span>
                              <span>
                                {format(contest.updatedAt, "MMMM d, yyyy")}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 pt-2 border-t bg-muted/30">
                <Button
                  variant="outline"
                  className="text-whit hover:bg-primary/70"
                  onClick={() =>
                    router.push(`/admin/contests/${contestId}/problems`)
                  }
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Problems
                </Button>
                <Button
                  onClick={handleAddProblems}
                  className="text-white hover:bg-primary/70"
                >
                  <Plus className="h-4 w-4 mr-2 text-white" />
                  Add Problems
                </Button>
              </CardFooter>
            </Card>

            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle>Contest Statistics</CardTitle>
                <CardDescription>
                  View participation metrics and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-muted/40 p-4 rounded-md">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Participants</h4>
                    </div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">
                      Total registered
                    </p>
                  </div>

                  <div className="bg-muted/40 p-4 rounded-md">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Submissions</h4>
                    </div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">
                      Total submissions
                    </p>
                  </div>

                  <div className="bg-muted/40 p-4 rounded-md">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Status</h4>
                    </div>
                    <div className="mt-1">{getStatusBadge(contest.status)}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Current contest status
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="problems" className="space-y-6">
            <Card className="border shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contest Problems</CardTitle>
                  <CardDescription>
                    All problems included in this contest
                  </CardDescription>
                </div>
                <Button
                  onClick={handleAddProblems}
                  className="text-white hover:bg-primary/70"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Problem
                </Button>
              </CardHeader>
              <CardContent>
                {loadingProblems ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : problems.length === 0 ? (
                  <div className="py-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No problems added yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      This contest doesn't have any problems. Add problems to
                      get started.
                    </p>
                    <Button
                      onClick={handleAddProblems}
                      className="text-white hover:bg-primary/70"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Problem
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {problems.map((problem, index) => (
                      <div
                        key={problem.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center text-primary font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-medium text-lg">
                                {problem.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                {getDifficultyBadge(problem.difficulty)}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {problem.timeLimit}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {problem.memoryLimit}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-primary/10 flex items-center gap-1"
                            onClick={() => handleViewProblem(problem.id)}
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                        <div className="mt-3 pl-11">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {problem.description.replace(/(<([^>]+)>)/gi, "")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle>Problem Management</CardTitle>
                <CardDescription>
                  Tools for organizing contest problems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/40 p-5 rounded-lg flex items-center gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Code className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">Problem Library</h3>
                      <p className="text-sm text-muted-foreground">
                        Create and manage all your coding problems
                      </p>
                      <Button
                        variant="link"
                        className="px-0 text-primary"
                        onClick={() => router.push("/admin/problems")}
                      >
                        Go to Problem Library
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted/40 p-5 rounded-lg flex items-center gap-4">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <BookOpen className="h-6 w-6 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">Problem Sets</h3>
                      <p className="text-sm text-muted-foreground">
                        Group problems into reusable sets
                      </p>
                      <Button
                        variant="link"
                        className="px-0 text-primary"
                        onClick={() => router.push("/admin/problem-sets")}
                      >
                        Manage Problem Sets
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 pt-2 border-t bg-muted/30">
                <Button
                  onClick={handleAddProblems}
                  className="text-white hover:bg-primary/70"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Problems
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle>Access Settings</CardTitle>
                <CardDescription>
                  Visibility and security configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/40 p-5 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    {contest.isPublic ? (
                      <>
                        <div className="bg-teal-100 p-2 rounded-full">
                          <Globe className="h-6 w-6 text-teal-700" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">
                            Public Contest
                          </h3>
                          <p className="text-muted-foreground">
                            This contest is visible to all users and anyone can
                            participate
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-purple-100 p-2 rounded-full">
                          <Lock className="h-6 w-6 text-purple-700" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">
                            Private Contest
                          </h3>
                          <p className="text-muted-foreground">
                            This contest is only accessible to users with the
                            security code
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {!contest.isPublic && contest.securityCode && (
                    <div className="mt-4 p-4 border rounded-md bg-accent/80">
                      <h4 className="font-medium mb-2">Security Code</h4>
                      <div className="flex items-center">
                        <code className="bg-muted p-2 rounded text-sm font-mono flex-1">
                          {contest.securityCode}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Share this code with participants to allow them access
                        to the contest
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-muted/40 p-5 rounded-lg">
                  <h3 className="font-medium mb-3">Status Configuration</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Current Status
                      </span>
                      <span className="font-medium">
                        {contest.status.charAt(0).toUpperCase() +
                          contest.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Auto-transition
                      </span>
                      <span className="font-medium">Disabled</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-amber-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Status must be manually updated when needed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle>Schedule Configuration</CardTitle>
                <CardDescription>
                  Timing settings for this contest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Start Date and Time</h3>
                      <div className="bg-muted/40 p-4 rounded-md flex items-center">
                        <Calendar className="h-5 w-5 text-primary mr-3" />
                        <div>
                          <p className="font-medium">
                            {format(contest.startDate, "MMMM d, yyyy")}
                          </p>
                          <p className="text-muted-foreground">
                            {format(contest.startDate, "h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">End Date and Time</h3>
                      <div className="bg-muted/40 p-4 rounded-md flex items-center">
                        <Calendar className="h-5 w-5 text-primary mr-3" />
                        <div>
                          <p className="font-medium">
                            {format(contest.endDate, "MMMM d, yyyy")}
                          </p>
                          <p className="text-muted-foreground">
                            {format(contest.endDate, "h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Contest Duration</h3>
                    <div className="bg-muted/40 p-4 rounded-md flex items-center">
                      <CalendarRange className="h-5 w-5 text-primary mr-3" />
                      <p className="font-medium">
                        {formatDuration(contest.startDate, contest.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-md">
              <CardHeader className="border-b">
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for this contest
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium mb-1">Edit Contest</h3>
                      <p className="text-sm text-muted-foreground">
                        Modify contest settings, schedule, and access
                        configuration
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleEditContest}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Contest
                    </Button>
                  </div>

                  <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium mb-1">Delete Contest</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently remove this contest and all its data
                      </p>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteConfirm}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Contest
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ContestViewPage;
