"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Code, FileText, Timer, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

// Import server actions
import {
  getContestById,
  getContestProblems,
  getTimeRemaining,
  getContestProgress,
} from "@/actions/contest-actions";
import { Contest, Problem } from "@/drizzle/schema";

export default function ContestProblemsPage() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const router = useRouter();
  const params = useParams();
  const contestId = params.contestId as string;

  // Use ref to store the latest contest data for interval
  const contestRef = useRef<Contest | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update contest ref whenever contest changes
  useEffect(() => {
    contestRef.current = contest;
  }, [contest]);

  // Function to update time remaining and progress
  const updateTimeAndProgress = useCallback(async () => {
    const currentContest = contestRef.current;
    if (!currentContest) return;

    try {
      const [updatedTimeRemaining, updatedProgress] = await Promise.all([
        getTimeRemaining(currentContest),
        getContestProgress(currentContest),
      ]);

      setTimeRemaining(updatedTimeRemaining);
      setProgress(updatedProgress);
    } catch (error) {
      console.error("Error updating time and progress:", error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchContestAndProblems = async () => {
      try {
        setLoading(true);

        // Fetch contest and problems in parallel
        const [contestData, problemsData] = await Promise.all([
          getContestById(contestId),
          getContestProblems(contestId),
        ]);

        setContest(contestData);
        setProblems(problemsData);

        // If contest exists, fetch initial time and progress
        if (contestData) {
          const [timeRemainingData, progressData] = await Promise.all([
            getTimeRemaining(contestData),
            getContestProgress(contestData),
          ]);

          setTimeRemaining(timeRemainingData);
          setProgress(progressData);
        }
      } catch (error) {
        console.error("Error fetching contest data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContestAndProblems();
  }, [contestId]);

  // Separate effect for interval management
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only set up interval if contest exists and is active
    if (contest && contest.status === "active") {
      intervalRef.current = setInterval(updateTimeAndProgress, 60000); // Update every minute
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [contest, updateTimeAndProgress]);

  // Function to get badge color based on difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-500 hover:bg-emerald-600 text-white";
      case "medium":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "hard":
        return "bg-rose-500 hover:bg-rose-600 text-white";
      default:
        return "bg-blue-500 hover:bg-blue-600 text-white";
    }
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case "ended":
        return <Badge className="bg-gray-500">Completed</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button
        variant="ghost"
        className="mb-6 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => router.push("/user")}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Contests
      </Button>

      {loading ? (
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-6" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      ) : !contest ? (
        <div className="text-center py-16 border rounded-lg bg-gray-50 dark:bg-gray-900">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-semibold mb-2">Contest not found</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            The contest you're looking for doesn't exist or you don't have
            access.
          </p>
          <Button
            onClick={() => router.push("/user")}
            className="bg-primary hover:bg-primary/90 transition-colors"
          >
            Return to Contests
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-10 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <h1 className="text-3xl font-bold">{contest.title}</h1>
                  {getStatusBadge(contest.status)}
                </div>
                <p className="text-muted-foreground text-lg">
                  {contest.description || "No description provided."}
                </p>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Clock className="h-6 w-6 text-blue-500" />
                <span className="font-semibold text-lg">{timeRemaining}</span>
              </div>
            </div>

            {contest.status === "active" && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span>Contest Progress</span>
                  <span className="text-primary">{progress}%</span>
                </div>
                <Progress
                  value={progress}
                  className="h-2 bg-gray-200 dark:bg-gray-700"
                />
              </div>
            )}
          </div>

          {problems.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">
                No problems available
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                This contest doesn't have any problems yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {problems.map((problem, index) => (
                <Card
                  key={problem.id}
                  className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center p-5 gap-4">
                      <div className="flex-grow">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-medium text-lg text-gray-600 dark:text-gray-400">
                            Problem {index + 1}:
                          </span>
                          <h3 className="font-semibold text-xl">
                            {problem.title}
                          </h3>
                          <Badge
                            className={`${getDifficultyColor(
                              problem.difficulty
                            )} ml-2 px-3 py-1 text-xs font-medium rounded-full`}
                          >
                            {problem.difficulty.charAt(0).toUpperCase() +
                              problem.difficulty.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4 text-blue-500" />
                            <span>Time Limit: {problem.timeLimit}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Code className="h-4 w-4 text-purple-500" />
                            <span>Memory Limit: {problem.memoryLimit}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          router.push(`/user/contests/problems/${problem.id}`)
                        }
                        className="md:self-center bg-primary hover:bg-primary/90 text-white font-medium px-5 py-2 rounded-md transition-colors cursor-pointer"
                      >
                        Solve Problem
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
