"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  List,
  PlusCircle,
  Loader2,
  Filter,
  Search,
  ArrowUpDown,
  Clock,
  Globe,
  Lock,
  Eye,
  Pencil,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

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
};

export default function ContestsPage() {
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function fetchContests() {
      try {
        const response = await fetch("/api/contests");

        if (!response.ok) {
          throw new Error("Failed to fetch contests");
        }

        const data = await response.json();

        // Parse dates received as strings back into Date objects
        const formattedData = data.map((contest: any) => ({
          ...contest,
          startDate: new Date(contest.startDate),
          endDate: new Date(contest.endDate),
          createdAt: new Date(contest.createdAt),
          updatedAt: new Date(contest.updatedAt),
        }));

        setContests(formattedData);
      } catch (err) {
        console.error("Error fetching contests:", err);
        setError("Failed to load contests. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchContests();
  }, []);

  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors border-0 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active
            </span>
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors border-0 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Draft
            </span>
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors border-0 font-medium">
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

  // Function to get date display with relative time indicator
  const getDateDisplay = (date: Date) => {
    const now = new Date();
    const isFuture = date > now;
    const isPast = date < now;
    let statusClass = "";

    if (isFuture) {
      statusClass = "text-foreground";
    } else if (isPast) {
      statusClass = "text-muted-foreground";
    }

    return (
      <div className={`flex items-center gap-2 ${statusClass} group`}>
        <div className="bg-muted/60 p-1.5 rounded-md group-hover:bg-muted transition-colors">
          <Calendar className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{format(date, "MMM d, yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {format(date, "h:mm a")}
          </span>
        </div>
      </div>
    );
  };

  // Filter contests based on active tab
  const filteredContests = contests.filter((contest) => {
    if (activeTab === "all") return true;
    return contest.status === activeTab;
  });

  // Get counts for tabs
  const getStatusCount = (status: string) => {
    if (status === "all") return contests.length;
    return contests.filter((contest) => contest.status === status).length;
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      {/* Header Section with gradient background */}
      <div className="relative mb-10 p-8 rounded-2xl bg-accent overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6),transparent)]"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-indigo-600">
            Contest Management
          </h1>
        </div>
      </div>

      {/* Tabs and Action Bar */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Tabs
            defaultValue="all"
            className="w-full md:w-auto"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-3 md:grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All
                <Badge variant="secondary" className="ml-1">
                  {getStatusCount("all")}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                Active
                <Badge variant="secondary" className="ml-1">
                  {getStatusCount("active")}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="draft" className="flex items-center gap-2">
                Draft
                <Badge variant="secondary" className="ml-1">
                  {getStatusCount("draft")}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex items-center gap-2"
              >
                Completed
                <Badge variant="secondary" className="ml-1">
                  {getStatusCount("completed")}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={() => router.push("/admin/contests/new")}
            className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="h-4 w-4 text-white" /> New Contest
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search contests..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Button
            variant="outline"
            className="flex items-center gap-2 border-input"
          >
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="border-b bg-card p-6">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-card-foreground">
                {activeTab === "all"
                  ? "All Contests"
                  : activeTab === "active"
                  ? "Active Contests"
                  : activeTab === "draft"
                  ? "Draft Contests"
                  : "Completed Contests"}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {activeTab === "all"
                  ? "View and manage all your coding competitions in one place"
                  : activeTab === "active"
                  ? "Currently running contests that participants can join"
                  : activeTab === "draft"
                  ? "Contests in preparation that are not yet published"
                  : "Past contests that have been completed"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-muted/50 text-muted-foreground"
              >
                {filteredContests.length}{" "}
                {activeTab === "all"
                  ? "Total"
                  : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-card">
          {isLoading ? (
            <div className="flex justify-center items-center p-16">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
                  <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto relative" />
                </div>
                <p className="text-muted-foreground">Loading contests...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-destructive text-2xl">!</span>
              </div>
              <h3 className="text-lg font-medium mb-2 text-card-foreground">
                Unable to load contests
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          ) : filteredContests.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <List className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-card-foreground">
                {activeTab === "all"
                  ? "No contests created yet"
                  : activeTab === "active"
                  ? "No active contests"
                  : activeTab === "draft"
                  ? "No draft contests"
                  : "No completed contests"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {activeTab === "all"
                  ? "Get started by creating your first coding contest. Define challenges, set time limits, and invite participants."
                  : activeTab === "active"
                  ? "You don't have any active contests at the moment. Publish a draft contest to make it active."
                  : activeTab === "draft"
                  ? "You don't have any contests in draft. Create a new contest to get started."
                  : "You don't have any completed contests. Active contests will move here once they end."}
              </p>
              <Button
                onClick={() => router.push("/admin/contests/new")}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 mx-auto shadow-md hover:shadow-lg transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                {activeTab === "all"
                  ? "Create Your First Contest"
                  : "Create New Contest"}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1">
                        Contest Title
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1">
                        Start Date
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1">
                        End Date
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground">
                      Visibility
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContests.map((contest) => (
                    <TableRow
                      key={contest.id}
                      className="border-b hover:bg-muted/10 transition-colors cursor-pointer group"
                      onClick={() =>
                        router.push(`/admin/contests/${contest.id}`)
                      }
                    >
                      <TableCell className="font-medium py-4">
                        <div>
                          <div className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                            {contest.title}
                          </div>
                          {contest.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {contest.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getDateDisplay(contest.startDate)}</TableCell>
                      <TableCell>{getDateDisplay(contest.endDate)}</TableCell>
                      <TableCell>{getStatusBadge(contest.status)}</TableCell>
                      <TableCell>
                        {contest.isPublic ? (
                          <Badge
                            variant="outline"
                            className="bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 transition-colors"
                          >
                            <Globe className="h-3 w-3 mr-1" /> Public
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-colors"
                          >
                            <Lock className="h-3 w-3 mr-1" /> Private
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className="flex justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/contests/${contest.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary-foreground hover:bg-primary transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/contests/${contest.id}/edit`);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/20 border-t p-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {filteredContests.length}{" "}
            {activeTab === "all" ? "contests" : `${activeTab} contests`}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" /> Export
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
