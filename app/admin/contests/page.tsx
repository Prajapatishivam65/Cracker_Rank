import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText } from "lucide-react";

// Mock data for contests
const contests = [
  {
    id: "1",
    title: "Weekly Challenge #42",
    description: "Solve algorithmic problems in this weekly coding challenge.",
    startDate: new Date("2023-05-15T10:00:00"),
    endDate: new Date("2023-05-15T12:00:00"),
    status: "completed",
    problemCount: 5,
  },
  {
    id: "2",
    title: "Data Structures Marathon",
    description:
      "Test your knowledge of data structures with these challenging problems.",
    startDate: new Date("2023-05-20T14:00:00"),
    endDate: new Date("2023-05-20T17:00:00"),
    status: "upcoming",
    problemCount: 8,
  },
  {
    id: "3",
    title: "Algorithms Showdown",
    description:
      "Compete in this algorithm-focused contest to test your skills.",
    startDate: new Date("2023-05-10T09:00:00"),
    endDate: new Date("2023-05-10T11:00:00"),
    status: "active",
    problemCount: 6,
  },
];

// Format date and time in a more readable way
const formatDateTime = (date: any) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function AdminContestsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Manage Contests
        </h1>
        <Button className="w-full sm:w-auto text-white">
          <Link href="/admin/contests/new" className="flex items-center gap-2">
            <span>Create Contest</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {contests.map((contest) => (
          <Card
            key={contest.id}
            className="overflow-hidden transition-all border hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg md:text-xl">
                  {contest.title}
                </CardTitle>
                <Badge
                  variant={
                    contest.status === "active"
                      ? "default"
                      : contest.status === "upcoming"
                      ? "secondary"
                      : "outline"
                  }
                  className="capitalize text-white"
                >
                  {contest.status}
                </Badge>
              </div>
              <CardDescription className="mt-2 line-clamp-2">
                {contest.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Start:</span>
                  <span className="ml-auto">
                    {formatDateTime(contest.startDate)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">End:</span>
                  <span className="ml-auto">
                    {formatDateTime(contest.endDate)}
                  </span>
                </div>
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Problems:</span>
                  <span className="ml-auto">{contest.problemCount}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 pt-0">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Link href={`/admin/contests/${contest.id}/edit`}>Edit</Link>
              </Button>
              <Button size="sm" className="w-full sm:w-auto text-white">
                <Link href={`/admin/contests/${contest.id}/problems`}>
                  Manage Problems
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
