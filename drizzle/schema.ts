import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  pgEnum,
  jsonb,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * ENUMS - Define enumerated types for the database
 */

// User roles enum (admin or regular user)
export const userRoles = ["admin", "user"] as const;
export type UserRole = (typeof userRoles)[number];
export const userRoleEnum = pgEnum("user_roles", userRoles);

// Contest status enum (tracking the lifecycle of a contest)
export const contestStatuses = ["draft", "active", "completed"] as const;
export type ContestStatus = (typeof contestStatuses)[number];
export const contestStatusEnum = pgEnum("contest_status", contestStatuses);

// Problem difficulty levels
export const difficulties = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof difficulties)[number];
export const difficultyEnum = pgEnum("difficulty", difficulties);

// Submission status enum (tracking the status of code submissions)
export const submissionStatuses = [
  "pending", // Initial state when submission is received
  "accepted", // Submission passes all test cases
  "wrong_answer", // Output doesn't match expected output
  "time_limit_exceeded", // Execution took too long
  "runtime_error", // Code crashed during execution
] as const;
export type SubmissionStatus = (typeof submissionStatuses)[number];
export const submissionStatusEnum = pgEnum(
  "submission_status",
  submissionStatuses
);

// Programming languages supported for code submissions and starter code
export const programmingLanguages = ["cpp", "java", "python"] as const;
export type ProgrammingLanguage = (typeof programmingLanguages)[number];
export const languageEnum = pgEnum(
  "programming_language",
  programmingLanguages
);

/**
 * BASE TABLES - Core entities of the system
 */

// Users table - Stores user accounts and authentication information
export const UserTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"), // Hashed password
  salt: text("salt"), // Salt for password hashing
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Contests table - Stores coding competitions
export const contests = pgTable("contests", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(), // When the contest begins
  endDate: timestamp("end_date").notNull(), // When the contest ends
  status: contestStatusEnum("status").notNull().default("draft"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => UserTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isPublic: boolean("is_public").default(true).notNull(), // Whether the contest is public or private
  securityCode: varchar("security_code", { length: 50 }), // Access code for private contests
});

/**
 * PROBLEM-RELATED TABLES - All entities related to coding problems
 */

// Problems table - Stores coding challenges within contests
export const problems = pgTable("problems", {
  id: uuid("id").primaryKey().defaultRandom(),
  contestId: uuid("contest_id")
    .notNull()
    .references(() => contests.id, { onDelete: "cascade" }), // Problems are deleted when their contest is deleted
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(), // Markdown-supported problem statement
  difficulty: difficultyEnum("difficulty").notNull().default("medium"),
  timeLimit: varchar("time_limit", { length: 50 })
    .notNull()
    .default("1 second"), // Max execution time
  memoryLimit: varchar("memory_limit", { length: 50 })
    .notNull()
    .default("256 megabytes"), // Max memory usage
  createdBy: uuid("created_by")
    .notNull()
    .references(() => UserTable.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  order: integer("order").notNull().default(0), // For ordering problems within a contest
});

// Constraints table - Stores problem constraints (e.g., "1 ≤ N ≤ 100")
export const constraints = pgTable("constraints", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  content: text("content").notNull(), // The actual constraint text
  order: integer("order").notNull().default(0), // For ordering constraints
});

// Hints table - Stores hints for solving problems
export const hints = pgTable("hints", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  content: text("content").notNull(), // The hint text
  order: integer("order").notNull().default(0), // For ordering hints
});

// Examples table - Stores sample inputs/outputs for problems
export const examples = pgTable("examples", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  input: text("input").notNull(), // Sample input
  output: text("output").notNull(), // Expected output
  explanation: text("explanation"), // Optional explanation of the example
  order: integer("order").notNull().default(0), // For ordering examples
});

// Starter Code table - Provides templates for different programming languages
export const starterCode = pgTable("starter_code", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  language: languageEnum("language").notNull(), // Programming language (cpp, java, python)
  code: text("code").notNull(), // The starter code template
});

// Test Cases table - Stores both visible and hidden test cases
export const testCases = pgTable("test_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  inputLines: jsonb("input_lines").notNull().$type<string[]>(), // Array of input lines
  expectedOutput: text("expected_output").notNull(), // Expected output for validation
  isHidden: boolean("is_hidden").default(false).notNull(), // Whether this is a hidden test case
  order: integer("order").notNull().default(0), // For ordering test cases
});

/**
 * USER PROGRESS TABLES - Track user participation and submissions
 */

// Submissions table - Stores user code submissions for problems
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => UserTable.id),
  language: languageEnum("language").notNull(), // Language of submission
  code: text("code").notNull(), // Submitted code
  status: submissionStatusEnum("status").notNull().default("pending"),
  executionTime: integer("execution_time"), // in milliseconds
  memoryUsed: integer("memory_used"), // in kilobytes
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  errorMessage: text("error_message"), // Error details if submission failed
});

// Contest Participants table - Tracks who joined which contests
export const contestParticipants = pgTable("contest_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  contestId: uuid("contest_id")
    .notNull()
    .references(() => contests.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  score: integer("score").default(0), // Participant's score in the contest
  rank: integer("rank"), // Final ranking in the contest
});

/**
 * RELATIONSHIPS - Define relationships between tables for Drizzle ORM
 */

// User relationships
export const userRelations = relations(UserTable, ({ many }) => ({
  createdContests: many(contests, { relationName: "creator" }),
  submissions: many(submissions),
  participations: many(contestParticipants),
  createdProblems: many(problems, { relationName: "problemCreator" }),
}));

// Contest relationships
export const contestRelations = relations(contests, ({ one, many }) => ({
  creator: one(UserTable, {
    fields: [contests.createdBy],
    references: [UserTable.id],
    relationName: "creator",
  }),
  problems: many(problems),
  participants: many(contestParticipants),
}));

// Problem relationships
export const problemRelations = relations(problems, ({ one, many }) => ({
  contest: one(contests, {
    fields: [problems.contestId],
    references: [contests.id],
  }),
  creator: one(UserTable, {
    fields: [problems.createdBy],
    references: [UserTable.id],
    relationName: "problemCreator",
  }),
  constraints: many(constraints),
  hints: many(hints),
  examples: many(examples),
  starterCodes: many(starterCode),
  testCases: many(testCases),
  submissions: many(submissions),
}));

// Constraint relationships
export const constraintRelations = relations(constraints, ({ one }) => ({
  problem: one(problems, {
    fields: [constraints.problemId],
    references: [problems.id],
  }),
}));

// Hint relationships
export const hintRelations = relations(hints, ({ one }) => ({
  problem: one(problems, {
    fields: [hints.problemId],
    references: [problems.id],
  }),
}));

// Example relationships
export const exampleRelations = relations(examples, ({ one }) => ({
  problem: one(problems, {
    fields: [examples.problemId],
    references: [problems.id],
  }),
}));

// Starter code relationships
export const starterCodeRelations = relations(starterCode, ({ one }) => ({
  problem: one(problems, {
    fields: [starterCode.problemId],
    references: [problems.id],
  }),
}));

// Test case relationships
export const testCaseRelations = relations(testCases, ({ one }) => ({
  problem: one(problems, {
    fields: [testCases.problemId],
    references: [problems.id],
  }),
}));

// Submission relationships
export const submissionRelations = relations(submissions, ({ one }) => ({
  problem: one(problems, {
    fields: [submissions.problemId],
    references: [problems.id],
  }),
  user: one(UserTable, {
    fields: [submissions.userId],
    references: [UserTable.id],
  }),
}));

// Contest participant relationships
export const contestParticipantRelations = relations(
  contestParticipants,
  ({ one }) => ({
    contest: one(contests, {
      fields: [contestParticipants.contestId],
      references: [contests.id],
    }),
    user: one(UserTable, {
      fields: [contestParticipants.userId],
      references: [UserTable.id],
    }),
  })
);

/**
 * TYPE EXPORTS - For TypeScript type safety
 */

// Export inferred types from tables for type safety in application code
export type User = typeof UserTable.$inferSelect;
export type NewUser = typeof UserTable.$inferInsert;

export type Contest = typeof contests.$inferSelect;
export type NewContest = typeof contests.$inferInsert;

export type Problem = typeof problems.$inferSelect;
export type NewProblem = typeof problems.$inferInsert;

export type Constraint = typeof constraints.$inferSelect;
export type NewConstraint = typeof constraints.$inferInsert;

export type Hint = typeof hints.$inferSelect;
export type NewHint = typeof hints.$inferInsert;

export type Example = typeof examples.$inferSelect;
export type NewExample = typeof examples.$inferInsert;

export type StarterCode = typeof starterCode.$inferSelect;
export type NewStarterCode = typeof starterCode.$inferInsert;

export type TestCase = typeof testCases.$inferSelect;
export type NewTestCase = typeof testCases.$inferInsert;

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

export type ContestParticipant = typeof contestParticipants.$inferSelect;
export type NewContestParticipant = typeof contestParticipants.$inferInsert;
