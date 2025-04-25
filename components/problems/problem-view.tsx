"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pencil,
  Clock,
  AlertCircle,
  Code,
  Server,
  CheckCircle,
  X,
  ChevronLeft,
  User,
  Trophy,
  FileText,
  Hash,
  Eye,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Submission {
  id: string;
  status: string;
  language: string;
  executionTime: number;
  memoryUsed: number;
  createdAt: string;
  errorMessage: string | null;
}

interface ProblemAdminViewProps {
  problem: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    timeLimit: string;
    memoryLimit: string;
    constraints: string[];
    hints: string[];
    examples: {
      input: string;
      output: string;
      explanation?: string;
    }[];
    starterCode: {
      cpp: string;
      java: string;
      python: string;
    };
    contestId: string;
    contestTitle: string;
    createdBy: string;
    creatorName: string;
    submissions: Submission[];
    order: number;
  };
  userId: string;
}

export default function ProblemAdminView({
  problem,
  userId,
}: ProblemAdminViewProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("cpp");
  const [activeTab, setActiveTab] = useState<string>("description");

  // Handle language change
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500 mr-2" />;
      case "wrong_answer":
        return <X className="h-4 w-4 text-red-500 mr-2" />;
      case "time_limit_exceeded":
        return <Clock className="h-4 w-4 text-yellow-500 mr-2" />;
      case "runtime_error":
        return <AlertCircle className="h-4 w-4 text-red-500 mr-2" />;
      case "pending":
        return (
          <span className="h-4 w-4 block rounded-full bg-blue-500 mr-2"></span>
        );
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500 mr-2" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "wrong_answer":
        return "Wrong Answer";
      case "time_limit_exceeded":
        return "Time Limit Exceeded";
      case "runtime_error":
        return "Runtime Error";
      case "pending":
        return "Pending";
      default:
        return status
          .split("_")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy h:mm a");
    } catch (e) {
      return "Unknown date";
    }
  };

  // Dummy submissions data for now
  const dummySubmissions = [
    {
      id: "1",
      status: "accepted",
      language: "cpp",
      executionTime: 120,
      memoryUsed: 8192,
      createdAt: new Date().toISOString(),
      errorMessage: null,
    },
    {
      id: "2",
      status: "wrong_answer",
      language: "python",
      executionTime: 150,
      memoryUsed: 7168,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      errorMessage: "Wrong output for test case 3",
    },
  ];

  const submissionsToDisplay =
    problem.submissions.length > 0 ? problem.submissions : dummySubmissions;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link href={`/contests/${problem.contestId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Contest
          </Button>
        </Link>
      </div>

      {/* Problem meta info */}
      <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 flex flex-wrap gap-4 items-center text-sm">
        <div className="flex items-center">
          <Trophy className="h-4 w-4 mr-2 text-orange-500" />
          <span className="mr-1 font-medium">Contest:</span>
          <Link
            href={`/contests/${problem.contestId}`}
            className="text-blue-600 hover:underline"
          >
            {problem.contestTitle}
          </Link>
        </div>
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-indigo-500" />
          <span className="mr-1 font-medium">Author:</span>
          <span>{problem.creatorName}</span>
        </div>
        <div className="flex items-center">
          <Hash className="h-4 w-4 mr-2 text-cyan-500" />
          <span className="mr-1 font-medium">Problem:</span>
          <span>{problem.order}</span>
        </div>
      </div>

      {/* Problem header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{problem.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Badge className={getDifficultyColor(problem.difficulty)}>
              {problem.difficulty}
            </Badge>
            <span className="flex items-center text-gray-600 dark:text-gray-400">
              <Clock className="mr-1 h-4 w-4" /> {problem.timeLimit}
            </span>
            <span className="flex items-center text-gray-600 dark:text-gray-400">
              <Server className="mr-1 h-4 w-4" /> {problem.memoryLimit}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/admin/problems/${problem.id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Problem
            </Button>
          </Link>
          <Link href={`/admin/problems/${problem.id}`}>
            <Button variant="default">
              <Eye className="mr-2 h-4 w-4" />
              User View
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Problem description and examples */}
        <div className="lg:col-span-2">
          <Tabs
            defaultValue="description"
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="hints">Hints</TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{problem.description}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Constraints</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-1">
                    {problem.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="space-y-6">
              {problem.examples.map((example, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>Example {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Input:</h4>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto whitespace-pre">
                        {example.input}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Output:</h4>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto whitespace-pre">
                        {example.output}
                      </pre>
                    </div>
                    {example.explanation && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Explanation:
                        </h4>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {example.explanation}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Hints Tab */}
            <TabsContent value="hints" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hints</CardTitle>
                  <CardDescription>
                    Hints provided to users when they're stuck.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {problem.hints.length > 0 ? (
                    <div className="space-y-4">
                      {problem.hints.map((hint, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-md border border-muted"
                        >
                          <p className="text-sm font-medium mb-1">
                            Hint {index + 1}:
                          </p>
                          <p className="text-sm">{hint}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center text-muted-foreground">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      No hints available for this problem.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Starter Code section (replaces the editor) */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Code className="mr-2 h-4 w-4" /> Starter Code
                </CardTitle>
                <Select
                  value={selectedLanguage}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <pre className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-md h-[400px] overflow-auto">
                {problem.starterCode[
                  selectedLanguage as keyof typeof problem.starterCode
                ] || "// No starter code available"}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submissions section with dummy data */}
      <div className="mt-8">
        <h2 className="text-xl font-medium mb-4">Recent Submissions</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {submissionsToDisplay.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">User</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Language</th>
                      <th className="text-left p-4">Time</th>
                      <th className="text-left p-4">Memory</th>
                      <th className="text-left p-4">Submitted At</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionsToDisplay.map((submission) => (
                      <tr key={submission.id} className="border-b">
                        <td className="p-4">User {submission.id}</td>
                        <td className="p-4">
                          <div className="flex items-center">
                            {getStatusIcon(submission.status)}
                            <span>{getStatusText(submission.status)}</span>
                          </div>
                        </td>
                        <td className="p-4">{submission.language}</td>
                        <td className="p-4">{submission.executionTime}ms</td>
                        <td className="p-4">
                          {(submission.memoryUsed / 1024).toFixed(2)} MB
                        </td>
                        <td className="p-4">
                          {formatDateTime(submission.createdAt)}
                        </td>
                        <td className="p-4">
                          <Link href={`/submissions/${submission.id}`}>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4 mr-1" /> View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="flex justify-center mb-4">
                    <FileText className="h-12 w-12 opacity-20" />
                  </div>
                  <p>No submissions for this problem yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Admin Stats Section */}
      <div className="mt-8">
        <h2 className="text-xl font-medium mb-4">Problem Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Submission Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32%</div>
              <p className="text-sm text-muted-foreground">
                65 of 203 users attempted
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18%</div>
              <p className="text-sm text-muted-foreground">
                12 of 65 attempts succeeded
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Average Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4</div>
              <p className="text-sm text-muted-foreground">
                Per successful solution
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
