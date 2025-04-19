"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Sample problems data
const problems = [
  { id: "1", name: "Two Sum", difficulty: "Easy" },
  { id: "2", name: "Add Two Numbers", difficulty: "Medium" },
  {
    id: "3",
    name: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
  },
  { id: "4", name: "Median of Two Sorted Arrays", difficulty: "Hard" },
  { id: "5", name: "Longest Palindromic Substring", difficulty: "Medium" },
  { id: "6", name: "ZigZag Conversion", difficulty: "Medium" },
  { id: "7", name: "Reverse Integer", difficulty: "Medium" },
  { id: "8", name: "String to Integer (atoi)", difficulty: "Medium" },
  { id: "9", name: "Palindrome Number", difficulty: "Easy" },
  { id: "10", name: "Regular Expression Matching", difficulty: "Hard" },
];

// Form schema with validation
const formSchema = z
  .object({
    name: z.string().min(3, {
      message: "Contest name must be at least 3 characters.",
    }),
    description: z.string().min(10, {
      message: "Description must be at least 10 characters.",
    }),
    startTime: z.date({
      required_error: "Start time is required.",
    }),
    endTime: z.date({
      required_error: "End time is required.",
    }),
    visibility: z.enum(["public", "private"], {
      required_error: "Please select contest visibility.",
    }),
    problems: z.array(z.string()).min(1, {
      message: "Select at least one problem.",
    }),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
  });

type FormValues = z.infer<typeof formSchema>;

export function ContestForm() {
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Initialize form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "public",
      problems: [],
    },
  });

  // Form submission handler
  function onSubmit(values: FormValues) {
    console.log(values);
    // Here you would typically send the data to your API
    alert("Contest created successfully!");
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contest Details</CardTitle>
        <CardDescription>
          Fill in the details to create a new coding contest.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contest Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Weekly Coding Challenge" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of your coding contest.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Who can see and participate in this contest.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the contest, rules, and any special instructions..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about the contest for participants.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm")
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            onChange={(e) => {
                              const date = new Date(field.value || new Date());
                              const [hours, minutes] =
                                e.target.value.split(":");
                              date.setHours(Number.parseInt(hours, 10));
                              date.setMinutes(Number.parseInt(minutes, 10));
                              field.onChange(date);
                            }}
                            value={
                              field.value
                                ? `${field.value
                                    .getHours()
                                    .toString()
                                    .padStart(2, "0")}:${field.value
                                    .getMinutes()
                                    .toString()
                                    .padStart(2, "0")}`
                                : ""
                            }
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When the contest will begin.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm")
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            onChange={(e) => {
                              const date = new Date(field.value || new Date());
                              const [hours, minutes] =
                                e.target.value.split(":");
                              date.setHours(Number.parseInt(hours, 10));
                              date.setMinutes(Number.parseInt(minutes, 10));
                              field.onChange(date);
                            }}
                            value={
                              field.value
                                ? `${field.value
                                    .getHours()
                                    .toString()
                                    .padStart(2, "0")}:${field.value
                                    .getMinutes()
                                    .toString()
                                    .padStart(2, "0")}`
                                : ""
                            }
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When the contest will end.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="problems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problems</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="justify-between w-full"
                          >
                            {selectedProblems.length > 0
                              ? `${selectedProblems.length} problem${
                                  selectedProblems.length > 1 ? "s" : ""
                                } selected`
                              : "Select problems"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search problems..." />
                            <CommandList>
                              <CommandEmpty>No problem found.</CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-auto">
                                {problems.map((problem) => (
                                  <CommandItem
                                    key={problem.id}
                                    value={problem.id}
                                    onSelect={() => {
                                      const newSelectedProblems =
                                        selectedProblems.includes(problem.id)
                                          ? selectedProblems.filter(
                                              (id) => id !== problem.id
                                            )
                                          : [...selectedProblems, problem.id];

                                      setSelectedProblems(newSelectedProblems);
                                      field.onChange(newSelectedProblems);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedProblems.includes(problem.id)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <span className="flex-1">
                                      {problem.name}
                                    </span>
                                    <Badge
                                      variant={
                                        problem.difficulty === "Easy"
                                          ? "outline"
                                          : problem.difficulty === "Medium"
                                          ? "secondary"
                                          : "destructive"
                                      }
                                      className="ml-2"
                                    >
                                      {problem.difficulty}
                                    </Badge>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {selectedProblems.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedProblems.map((id) => {
                            const problem = problems.find((p) => p.id === id);
                            return (
                              <Badge
                                key={id}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {problem?.name}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 ml-1"
                                  onClick={() => {
                                    const newSelectedProblems =
                                      selectedProblems.filter(
                                        (selectedId) => selectedId !== id
                                      );
                                    setSelectedProblems(newSelectedProblems);
                                    field.onChange(newSelectedProblems);
                                  }}
                                >
                                  ×
                                </Button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Select problems to include in this contest.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            >
              Create Contest
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
