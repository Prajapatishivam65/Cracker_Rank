"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, Clock, Trophy, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Contest } from "@/drizzle/schema";
import { SecurityCodeModal } from "@/components/custom/SecurityCodeModal";
import {
  getContestById,
  getContestStatus,
  getTimeRemaining,
  getContestProgress,
} from "@/actions/contest-actions";

export default function UserContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [contestStatuses, setContestStatuses] = useState<
    Record<string, string>
  >({});
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>(
    {}
  );
  const [progress, setProgress] = useState<Record<string, number>>({});
  const router = useRouter();

  // State for security code modal
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [selectedContestId, setSelectedContestId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchContests = async () => {
      try {
        // Using fetch for the initial contests list
        const response = await fetch("/api/contests");
        if (!response.ok) throw new Error("Failed to fetch contests");
        const data = await response.json();
        setContests(data);

        // Calculate status, time remaining, and progress for each contest
        const statusMap: Record<string, string> = {};
        const timeMap: Record<string, string> = {};
        const progressMap: Record<string, number> = {};

        for (const contest of data) {
          const status = await getContestStatus(contest);
          statusMap[contest.id] = status;

          const time = await getTimeRemaining(contest);
          timeMap[contest.id] = time;

          const prog = await getContestProgress(contest);
          progressMap[contest.id] = prog;
        }

        setContestStatuses(statusMap);
        setTimeRemaining(timeMap);
        setProgress(progressMap);
      } catch (error) {
        console.error("Error fetching contests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();

    // Set up interval to update time remaining
    const interval = setInterval(async () => {
      if (contests.length === 0) return;

      const timeMap: Record<string, string> = {};
      const progressMap: Record<string, number> = {};

      for (const contest of contests) {
        const time = await getTimeRemaining(contest);
        timeMap[contest.id] = time;

        const prog = await getContestProgress(contest);
        progressMap[contest.id] = prog;
      }

      setTimeRemaining(timeMap);
      setProgress(progressMap);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [contests.length]);

  // Function to handle contest access
  const handleContestAccess = (contest: Contest) => {
    const contestStatus = contestStatuses[contest.id] || contest.status;

    // If contest is in draft mode, don't allow access
    if (contestStatus === "draft") {
      return;
    }

    // If contest is private, open security code modal
    if (!contest.isPublic) {
      setSelectedContestId(contest.id);
      setSecurityModalOpen(true);
    } else {
      // If contest is public, redirect directly
      router.push(`/user/contests/${contest.id}`);
    }
  };

  // Function to determine badge color based on contest status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600";
      case "upcoming":
        return "bg-blue-500 hover:bg-blue-600";
      case "ended":
        return "bg-gray-500 hover:bg-gray-600";
      case "draft":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  // Function to format date for display
  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Coding Contests</h1>
          <p className="text-muted-foreground">
            Compete, solve challenges, and improve your coding skills
          </p>
        </div>
        <Button
          className="mt-4 md:mt-0"
          onClick={() => router.push("/user/leaderboard")}
        >
          <Trophy className="mr-2 h-4 w-4" />
          Global Leaderboard
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : contests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No contests available</h2>
          <p className="text-muted-foreground mb-6">
            Check back later for upcoming contests or create your own!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((contest) => {
            const contestStatus = contestStatuses[contest.id] || contest.status;
            const remainingTime = timeRemaining[contest.id] || "";
            const contestProgress = progress[contest.id] || 0;

            return (
              <Card
                key={contest.id}
                className="overflow-hidden flex flex-col border-t-4"
                style={{
                  borderTopColor:
                    contestStatus === "active"
                      ? "rgb(34, 197, 94)"
                      : contestStatus === "upcoming"
                      ? "rgb(59, 130, 246)"
                      : "rgb(107, 114, 128)",
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{contest.title}</CardTitle>
                    <Badge className={getStatusBadgeClass(contestStatus)}>
                      {contestStatus.charAt(0).toUpperCase() +
                        contestStatus.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    {contest.isPublic ? (
                      <>
                        <Users className="h-3 w-3 mr-1" />
                        Public Contest
                      </>
                    ) : (
                      <>
                        <Users className="h-3 w-3 mr-1" />
                        Private Contest
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {contest.description || "No description provided."}
                  </p>

                  {contestStatus === "active" && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${contestProgress}%` }}
                      ></div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Start: {formatDate(contest.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>End: {formatDate(contest.endDate)}</span>
                    </div>
                    {contestStatus === "active" && (
                      <div className="flex items-center gap-1 mt-1 text-green-600 font-medium">
                        <Clock className="h-4 w-4" />
                        <span>{remainingTime}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleContestAccess(contest)}
                    disabled={contestStatus === "draft"}
                    variant={
                      contestStatus === "active"
                        ? "default"
                        : contestStatus === "ended"
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {contestStatus === "active"
                      ? "Enter Contest"
                      : contestStatus === "upcoming"
                      ? "View Details"
                      : contestStatus === "ended"
                      ? "View Results"
                      : "Coming Soon"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Security Code Modal */}
      {selectedContestId && (
        <SecurityCodeModal
          isOpen={securityModalOpen}
          contestId={selectedContestId}
          onClose={() => {
            setSecurityModalOpen(false);
            setSelectedContestId(null);
          }}
        />
      )}
    </div>
  );
}
