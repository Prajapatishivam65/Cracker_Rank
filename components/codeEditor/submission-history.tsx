"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  MemoryStickIcon as Memory,
  Code,
  Calendar,
  Eye,
} from "lucide-react";
import {
  getSubmissionHistory,
  getSubmissionDetails,
} from "@/actions/submission-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Submission {
  id: string;
  language: "cpp" | "java" | "python";
  status:
    | "pending"
    | "accepted"
    | "wrong_answer"
    | "time_limit_exceeded"
    | "runtime_error";
  executionTime?: number | null;
  memoryUsed?: number | null;
  createdAt: Date;
  errorMessage?: string | null;
  code?: string;
  problem?: { [key: string]: any };
  problemId?: string;
}

interface SubmissionHistoryProps {
  problemId: string;
}

const statusColors = {
  pending: "bg-yellow-500",
  accepted: "bg-green-500",
  wrong_answer: "bg-red-500",
  time_limit_exceeded: "bg-orange-500",
  runtime_error: "bg-purple-500",
};

const statusLabels = {
  pending: "Pending",
  accepted: "Accepted",
  wrong_answer: "Wrong Answer",
  time_limit_exceeded: "Time Limit Exceeded",
  runtime_error: "Runtime Error",
};

const languageLabels = {
  cpp: "C++",
  java: "Java",
  python: "Python",
};

export default function SubmissionHistory({
  problemId,
}: SubmissionHistoryProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [problemId]);

  const loadSubmissions = async () => {
    try {
      const history = await getSubmissionHistory(problemId);
      setSubmissions(history);
    } catch (error) {
      console.error("Failed to load submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewSubmissionDetails = async (submissionId: string) => {
    try {
      const details = await getSubmissionDetails(submissionId);
      if (details) {
        setSelectedSubmission(details);
      }
    } catch (error) {
      console.error("Failed to load submission details:", error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Submission History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading submissions...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Submission History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No submissions yet
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={`${statusColors[submission.status]} text-white`}
                    >
                      {statusLabels[submission.status]}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Code className="h-3 w-3" />
                      {languageLabels[submission.language]}
                    </div>
                    {submission.executionTime && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {submission.executionTime}ms
                      </div>
                    )}
                    {submission.memoryUsed && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Memory className="h-3 w-3" />
                        {submission.memoryUsed}KB
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewSubmissionDetails(submission.id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>Submission Details</DialogTitle>
                        </DialogHeader>
                        {selectedSubmission && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">
                                  Status
                                </label>
                                <Badge
                                  variant="secondary"
                                  className={`${statusColors[selectedSubmission.status]} text-white ml-2`}
                                >
                                  {statusLabels[selectedSubmission.status]}
                                </Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Language
                                </label>
                                <span className="ml-2">
                                  {languageLabels[selectedSubmission.language]}
                                </span>
                              </div>
                            </div>
                            {selectedSubmission.errorMessage && (
                              <div>
                                <label className="text-sm font-medium text-red-600">
                                  Error Message
                                </label>
                                <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm">
                                  {selectedSubmission.errorMessage}
                                </div>
                              </div>
                            )}
                            <div>
                              <label className="text-sm font-medium">
                                Code
                              </label>
                              <pre className="mt-1 p-4 bg-muted rounded-lg overflow-auto text-sm">
                                <code>{selectedSubmission.code}</code>
                              </pre>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
