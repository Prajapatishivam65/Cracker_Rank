"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Save,
  AlertTriangle,
  Globe,
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
// Import the contests table schema
import { eq } from "drizzle-orm"; // Import drizzle-orm operators for queries
import { db } from "@/drizzle/db";
import { contests } from "@/drizzle/schema";

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

export default function EditContestPage() {
  const router = useRouter();
  const params = useParams();
  const contestId = "3e052d58-78da-4f70-9e4e-5b2c2cfde719";
  // Todo: Use params.contestId when contestId is passed in URL
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contest, setContest] = useState<Contest | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    status: "draft",
    isPublic: true,
    securityCode: "",
  });

  useEffect(() => {
    async function fetchContest() {
      try {
        setIsLoading(true);

        console.log("Fetching contest with ID:", contestId);
        if (!contestId) {
          throw new Error("Contest ID is required");
        }

        // Fetch contest directly from database using Drizzle ORM
        const contestData = await db.query.contests.findFirst({
          where: eq(contests.id, contestId),
        });

        if (!contestData) {
          throw new Error("Contest not found");
        }

        // Set the contest state
        setContest(contestData as Contest);

        // Format dates and times for form inputs
        setFormData({
          title: contestData.title,
          description: contestData.description || "",
          startDate: format(new Date(contestData.startDate), "yyyy-MM-dd"),
          startTime: format(new Date(contestData.startDate), "HH:mm"),
          endDate: format(new Date(contestData.endDate), "yyyy-MM-dd"),
          endTime: format(new Date(contestData.endDate), "HH:mm"),
          status: contestData.status,
          isPublic: contestData.isPublic,
          securityCode: contestData.securityCode || "",
        });
      } catch (err) {
        console.error("Error fetching contest:", err);
        setError("Failed to load contest. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    if (contestId) {
      fetchContest();
    }
  }, [contestId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // Combine date and time strings into Date objects
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`
      );
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      // Validate dates
      if (endDateTime <= startDateTime) {
        throw new Error("End date must be after start date");
      }

      // Create the updated contest object
      const updatedContest = {
        title: formData.title,
        description: formData.description || null,
        startDate: startDateTime,
        endDate: endDateTime,
        status: formData.status as "draft" | "active" | "completed",
        isPublic: formData.isPublic,
        securityCode: formData.isPublic ? null : formData.securityCode || null,
        updatedAt: new Date(),
      };

      // Update the contest in the database
      // console.log("Updating contest with ID:", contestId, updatedContest);

      const res = await db
        .update(contests)
        .set(updatedContest)
        .where(eq(contests.id, contestId));

      // console.log("Update result:", res);

      // Update local state
      setContest((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...updatedContest,
        };
      });

      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Error updating contest:", err);
      setError(err.message || "Failed to update contest. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
              {isLoading
                ? "Loading Contest..."
                : `Edit Contest: ${contest?.title}`}
            </h1>
            <p className="text-muted-foreground">
              Update contest details, schedule, and visibility settings
            </p>
          </div>

          {contest && (
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
          )}
        </div>
      </div>

      {isLoading ? (
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
      ) : error && !contest ? (
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
      ) : (
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="visibility">Visibility & Access</TabsTrigger>
            </TabsList>

            <div className="space-y-6">
              <TabsContent value="general" className="space-y-6">
                <Card className="border shadow-md">
                  <CardHeader>
                    <CardTitle>Contest Details</CardTitle>
                    <CardDescription>
                      Basic information about your coding contest
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Contest Title{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter contest title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your contest, rules, and objectives"
                        rows={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleSelectChange("status", value)
                        }
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Draft contests are not visible to participants. Active
                        contests are open for participation.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                <Card className="border shadow-md">
                  <CardHeader>
                    <CardTitle>Contest Schedule</CardTitle>
                    <CardDescription>
                      Set the start and end times for your contest
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="startDate">
                            Start Date{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <div className="flex items-center mt-2">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input
                              id="startDate"
                              name="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="startTime">
                            Start Time{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <div className="flex items-center mt-2">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input
                              id="startTime"
                              name="startTime"
                              type="time"
                              value={formData.startTime}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="endDate">
                            End Date <span className="text-destructive">*</span>
                          </Label>
                          <div className="flex items-center mt-2">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input
                              id="endDate"
                              name="endDate"
                              type="date"
                              value={formData.endDate}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="endTime">
                            End Time <span className="text-destructive">*</span>
                          </Label>
                          <div className="flex items-center mt-2">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input
                              id="endTime"
                              name="endTime"
                              type="time"
                              value={formData.endTime}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {new Date(`${formData.endDate}T${formData.endTime}`) <=
                      new Date(
                        `${formData.startDate}T${formData.startTime}`
                      ) && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 flex items-start">
                        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-amber-500" />
                        <p className="text-sm">
                          End date and time must be after start date and time.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="visibility" className="space-y-6">
                <Card className="border shadow-md">
                  <CardHeader>
                    <CardTitle>Visibility & Access Control</CardTitle>
                    <CardDescription>
                      Control who can see and participate in your contest
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isPublic" className="text-base">
                          Public Contest
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Make this contest visible to all users
                        </p>
                      </div>
                      <Switch
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) =>
                          handleSwitchChange("isPublic", checked)
                        }
                      />
                    </div>

                    <Separator />

                    {!formData.isPublic && (
                      <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="flex items-start mb-4">
                            <Lock className="h-5 w-5 mr-2 text-primary" />
                            <div>
                              <h4 className="font-medium">Private Contest</h4>
                              <p className="text-sm text-muted-foreground">
                                This contest will only be accessible to users
                                with the security code
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="securityCode">Security Code</Label>
                            <Input
                              id="securityCode"
                              name="securityCode"
                              value={formData.securityCode}
                              onChange={handleInputChange}
                              placeholder="Enter a security code for access"
                            />
                            <p className="text-xs text-muted-foreground">
                              Participants will need this code to access the
                              contest
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.isPublic && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start">
                          <Globe className="h-5 w-5 mr-2 text-primary" />
                          <div>
                            <h4 className="font-medium">Public Contest</h4>
                            <p className="text-sm text-muted-foreground">
                              This contest will be visible to all users and
                              anyone can participate
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20 p-4 rounded-lg border">
            <div className="flex-1">
              {error && (
                <div className="flex items-center text-destructive mb-2">
                  <XCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="flex items-center text-emerald-600 mb-2">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  <span className="text-sm">Contest updated successfully!</span>
                </div>
              )}

              <div className="flex items-center text-muted-foreground">
                <HelpCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  All changes are saved automatically
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => router.back()}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-primary text-white hover:bg-primary/70"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
