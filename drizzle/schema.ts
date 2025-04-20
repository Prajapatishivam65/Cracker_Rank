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
} from "drizzle-orm/pg-core";

// Enums
export const userRoles = ["admin", "user"] as const;
export type UserRole = (typeof userRoles)[number];
export const userRoleEnum = pgEnum("user_roles", userRoles);

export const contestStatuses = ["draft", "active", "completed"] as const;
export const contestStatusEnum = pgEnum("contest_status", contestStatuses);

export const difficulties = ["easy", "medium", "hard"] as const;
export const difficultyEnum = pgEnum("difficulty", difficulties);

export const submissionStatuses = [
  "pending",
  "accepted",
  "wrong_answer",
  "time_limit_exceeded",
  "runtime_error",
] as const;
export const submissionStatusEnum = pgEnum(
  "submission_status",
  submissionStatuses
);

// Users Table
export const UserTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  salt: text("salt"),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Contests Table
export const contests = pgTable("contests", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: contestStatusEnum("status").notNull().default("draft"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => UserTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  securityCode: varchar("security_code", { length: 50 }),
});

// // Problems Table
// export const problems = pgTable("problems", {
//   id: serial("id").primaryKey(),
//   title: varchar("title", { length: 255 }).notNull(),
//   description: text("description").notNull(),
//   difficulty: difficultyEnum("difficulty").notNull(),
//   timeLimit: integer("time_limit").notNull().default(1000),
//   memoryLimit: integer("memory_limit").notNull().default(256),
//   inputFormat: text("input_format"),
//   outputFormat: text("output_format"),
//   constraints: text("constraints"),
//   createdBy: integer("created_by").notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// });

// // Contest Problems (Many-to-Many)
// export const contestProblems = pgTable("contest_problems", {
//   id: serial("id").primaryKey(),
//   contestId: integer("contest_id").notNull(),
//   problemId: integer("problem_id").notNull(),
//   order: integer("order").notNull(),
//   points: integer("points").notNull().default(100),
// });

// // Test Cases
// export const testCases = pgTable("test_cases", {
//   id: serial("id").primaryKey(),
//   problemId: integer("problem_id").notNull(),
//   input: text("input").notNull(),
//   expectedOutput: text("expected_output").notNull(),
//   isSample: boolean("is_sample").default(false).notNull(),
//   explanation: text("explanation"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // Submissions
// export const submissions = pgTable("submissions", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id").notNull(),
//   problemId: integer("problem_id").notNull(),
//   contestId: integer("contest_id"),
//   code: text("code").notNull(),
//   status: submissionStatusEnum("status").notNull().default("pending"),
//   executionTime: integer("execution_time"),
//   memoryUsed: integer("memory_used"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // Submission Results
// export const submissionResults = pgTable("submission_results", {
//   id: serial("id").primaryKey(),
//   submissionId: integer("submission_id").notNull(),
//   testCaseId: integer("test_case_id").notNull(),
//   passed: boolean("passed").notNull(),
//   output: text("output"),
//   executionTime: integer("execution_time"),
//   memoryUsed: integer("memory_used"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // Contest Participants
// export const contestParticipants = pgTable("contest_participants", {
//   id: serial("id").primaryKey(),
//   contestId: integer("contest_id").notNull(),
//   userId: integer("user_id").notNull(),
//   joinedAt: timestamp("joined_at").defaultNow().notNull(),
//   score: integer("score").default(0).notNull(),
//   rank: integer("rank"),
// });

// // Tags
// export const tags = pgTable("tags", {
//   id: serial("id").primaryKey(),
//   name: varchar("name", { length: 50 }).notNull().unique(),
//   description: text("description"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // Problem Tags (Many-to-Many)
// export const problemTags = pgTable("problem_tags", {
//   id: serial("id").primaryKey(),
//   problemId: integer("problem_id").notNull(),
//   tagId: integer("tag_id").notNull(),
// });
