This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

-- Users table
CREATE TABLE users (
id VARCHAR(36) PRIMARY KEY,
username VARCHAR(50) NOT NULL UNIQUE,
email VARCHAR(100) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
full_name VARCHAR(100),
role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contests table
CREATE TABLE contests (
id VARCHAR(36) PRIMARY KEY,
title VARCHAR(255) NOT NULL,
description TEXT,
start_time TIMESTAMP NOT NULL,
end_time TIMESTAMP NOT NULL,
created_by VARCHAR(36) NOT NULL,
is_public BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Problems table
CREATE TABLE problems (
id VARCHAR(36) PRIMARY KEY,
title VARCHAR(255) NOT NULL,
description TEXT NOT NULL,
difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL DEFAULT 'Medium',
time_limit VARCHAR(50) NOT NULL DEFAULT '1 second',
memory_limit VARCHAR(50) NOT NULL DEFAULT '256 megabytes',
created_by VARCHAR(36) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Contest_Problems join table (many-to-many relationship)
CREATE TABLE contest_problems (
contest_id VARCHAR(36) NOT NULL,
problem_id VARCHAR(36) NOT NULL,
problem_order INT NOT NULL,
points INT NOT NULL DEFAULT 100,
PRIMARY KEY (contest_id, problem_id),
FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- Problem constraints
CREATE TABLE problem_constraints (
id VARCHAR(36) PRIMARY KEY,
problem_id VARCHAR(36) NOT NULL,
constraint_text VARCHAR(255) NOT NULL,
constraint_order INT NOT NULL,
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- Problem hints
CREATE TABLE problem_hints (
id VARCHAR(36) PRIMARY KEY,
problem_id VARCHAR(36) NOT NULL,
hint_text TEXT NOT NULL,
hint_order INT NOT NULL,
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- Problem examples
CREATE TABLE problem_examples (
id VARCHAR(36) PRIMARY KEY,
problem_id VARCHAR(36) NOT NULL,
input TEXT NOT NULL,
output TEXT NOT NULL,
explanation TEXT,
example_order INT NOT NULL,
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- Problem starter code for different languages
CREATE TABLE problem_starter_code (
id VARCHAR(36) PRIMARY KEY,
problem_id VARCHAR(36) NOT NULL,
language VARCHAR(50) NOT NULL,
code TEXT NOT NULL,
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
UNIQUE (problem_id, language)
);

-- Test cases (visible)
CREATE TABLE problem_test_cases (
id VARCHAR(36) PRIMARY KEY,
problem_id VARCHAR(36) NOT NULL,
is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
expected_output TEXT NOT NULL,
test_order INT NOT NULL,
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- Test case input lines
CREATE TABLE test_case_inputs (
id VARCHAR(36) PRIMARY KEY,
test_case_id VARCHAR(36) NOT NULL,
input_line TEXT NOT NULL,
line_order INT NOT NULL,
FOREIGN KEY (test_case_id) REFERENCES problem_test_cases(id) ON DELETE CASCADE
);

-- User submissions
CREATE TABLE submissions (
id VARCHAR(36) PRIMARY KEY,
problem_id VARCHAR(36) NOT NULL,
user_id VARCHAR(36) NOT NULL,
contest_id VARCHAR(36), -- Can be NULL for practice submissions
language VARCHAR(50) NOT NULL,
code TEXT NOT NULL,
status ENUM('AC', 'WA', 'TLE', 'MLE', 'CE', 'RE', 'PE', 'OLE', 'Pending') NOT NULL DEFAULT 'Pending',
execution_time INT, -- in milliseconds
memory_used INT, -- in kilobytes
score INT DEFAULT 0,
submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (problem_id) REFERENCES problems(id),
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE SET NULL
);

-- Test case results for each submission
CREATE TABLE submission_results (
id VARCHAR(36) PRIMARY KEY,
submission_id VARCHAR(36) NOT NULL,
test_case_id VARCHAR(36) NOT NULL,
status ENUM('AC', 'WA', 'TLE', 'MLE', 'RE', 'PE', 'OLE') NOT NULL,
execution_time INT, -- in milliseconds
memory_used INT, -- in kilobytes
FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
FOREIGN KEY (test_case_id) REFERENCES problem_test_cases(id) ON DELETE CASCADE
);

-- User participation in contests
CREATE TABLE contest_participants (
contest_id VARCHAR(36) NOT NULL,
user_id VARCHAR(36) NOT NULL,
joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (contest_id, user_id),
FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_problems_created_by ON problems(created_by);
CREATE INDEX idx_contest_problems_contest ON contest_problems(contest_id);
CREATE INDEX idx_contest_problems_problem ON contest_problems(problem_id);
CREATE INDEX idx_problem_constraints ON problem_constraints(problem_id);
CREATE INDEX idx_problem_hints ON problem_hints(problem_id);
CREATE INDEX idx_problem_examples ON problem_examples(problem_id);
CREATE INDEX idx_problem_starter ON problem_starter_code(problem_id);
CREATE INDEX idx_test_cases ON problem_test_cases(problem_id);
CREATE INDEX idx_test_case_inputs ON test_case_inputs(test_case_id);
CREATE INDEX idx_submissions_problem ON submissions(problem_id);
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_contest ON submissions(contest_id);
CREATE INDEX idx_submission_results ON submission_results(submission_id);
