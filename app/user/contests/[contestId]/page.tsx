"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Code, FileText, Timer } from "lucide-react";
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
  //   const contestId = params.contestId;
  const contestId = "3e052d58-78da-4f70-9e4e-5b2c2cfde719";

  useEffect(() => {
    // Fetch contest details and problems using server actions
    const fetchContestAndProblems = async () => {
      try {
        // Fetch contest details using server action
        const contestData = await getContestById(contestId);
        setContest(contestData);

        if (contestData) {
          // Fetch time remaining and progress
          const timeRemainingData = await getTimeRemaining(contestData);
          setTimeRemaining(timeRemainingData);

          const progressData = await getContestProgress(contestData);
          setProgress(progressData);
        }

        // Fetch problems for this contest using server action
        const problemsData = await getContestProblems(contestId);
        setProblems(problemsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContestAndProblems();

    // Set up interval to update time remaining
    const intervalId = setInterval(async () => {
      if (contest) {
        const updatedTimeRemaining = await getTimeRemaining(contest);
        setTimeRemaining(updatedTimeRemaining);

        const updatedProgress = await getContestProgress(contest);
        setProgress(updatedProgress);
      }
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [contestId, contest]);

  // Function to get badge color based on difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500 hover:bg-green-600";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "hard":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6 flex items-center gap-2"
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
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Contest not found</h2>
          <p className="text-muted-foreground mb-6">
            The contest you're looking for doesn't exist or you don't have
            access.
          </p>
          <Button onClick={() => router.push("/user")}>
            Return to Contests
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold">{contest.title}</h1>
                <p className="text-muted-foreground">
                  {contest.description || "No description provided."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-medium">{timeRemaining}</span>
              </div>
            </div>

            {contest.status === "active" && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Contest Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>

          {problems.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                No problems available
              </h2>
              <p className="text-muted-foreground">
                This contest doesn't have any problems yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <Card key={problem.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center p-4 gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-lg">
                            Problem {index + 1}:
                          </span>
                          <h3 className="font-semibold text-lg">
                            {problem.title}
                          </h3>
                          <Badge
                            className={getDifficultyColor(problem.difficulty)}
                          >
                            {problem.difficulty.charAt(0).toUpperCase() +
                              problem.difficulty.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            <span>Time Limit: {problem.timeLimit}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Code className="h-4 w-4" />
                            <span>Memory Limit: {problem.memoryLimit}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          router.push(
                            `/user/contests/${contestId}/problems/${problem.id}`
                          )
                        }
                        className="md:self-center"
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
