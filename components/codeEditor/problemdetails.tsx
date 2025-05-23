"use client";

import React from "react";

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface StarterCode {
  cpp: string;
  java: string;
  python: string;
}

interface ProblemData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: string;
  memoryLimit: string;
  constraints: string[];
  hints: string[];
  examples: Example[];
  starterCode: StarterCode;
  contestId: string;
  createdBy: string;
  creatorName: string;
  contestTitle: string;
  submissions: any[];
  order: number;
  testCases: Example[];
  hiddenTestCases: Example[];
}

interface Props {
  problemData: ProblemData;
}

const ProblemDetails: React.FC<Props> = ({ problemData }) => {
  return (
    <div className="p-5 font-sans leading-relaxed">
      <h1 className="text-2xl font-bold">{problemData.title}</h1>
      <p>
        <strong>ID:</strong> {problemData.id}
      </p>
      <p>
        <strong>Difficulty:</strong> {problemData.difficulty}
      </p>
      <p>
        <strong>Time Limit:</strong> {problemData.timeLimit}
      </p>
      <p>
        <strong>Memory Limit:</strong> {problemData.memoryLimit}
      </p>

      <h2 className="mt-4 text-xl font-semibold">Description</h2>
      <p>{problemData.description}</p>

      <h3 className="mt-4 font-semibold">Constraints</h3>
      <ul className="list-disc list-inside">
        {problemData.constraints.map((c, idx) => (
          <li key={idx}>{c}</li>
        ))}
      </ul>

      <h3 className="mt-4 font-semibold">Hints</h3>
      <ul className="list-disc list-inside">
        {problemData.hints.map((h, idx) => (
          <li key={idx}>{h}</li>
        ))}
      </ul>

      <h3 className="mt-4 font-semibold">Examples</h3>
      {problemData.examples.map((ex, idx) => (
        <div key={idx} className="mb-4 pl-4 border-l-4 border-gray-300">
          <p>
            <strong>Input:</strong>
            <br />
            <pre>{ex.input}</pre>
          </p>
          <p>
            <strong>Output:</strong>
            <br />
            <pre>{ex.output}</pre>
          </p>
          {ex.explanation && (
            <p>
              <strong>Explanation:</strong>
              <br />
              {ex.explanation}
            </p>
          )}
        </div>
      ))}

      <h3 className="mt-4 font-semibold">Test Cases</h3>
      {problemData.testCases.map((tc, idx) => (
        <div key={idx} className="mb-4 pl-4 border-l-4 border-green-400">
          <p>
            <strong>Input:</strong>
            <br />
            <pre>{tc.input}</pre>
          </p>
          <p>
            <strong>Output:</strong>
            <br />
            <pre>{tc.output}</pre>
          </p>
          {tc.explanation && (
            <p>
              <strong>Explanation:</strong>
              <br />
              {tc.explanation}
            </p>
          )}
        </div>
      ))}

      <h3 className="mt-4 font-semibold">Hidden Test Cases</h3>
      {problemData.hiddenTestCases.map((tc, idx) => (
        <div
          key={idx}
          className="mb-4 pl-4 border-l-4 border-red-400 bg-gray-100"
        >
          <p>
            <strong>Input:</strong>
            <br />
            <pre>{tc.input}</pre>
          </p>
          <p>
            <strong>Output:</strong>
            <br />
            <pre>{tc.output}</pre>
          </p>
          {tc.explanation && (
            <p>
              <strong>Explanation:</strong>
              <br />
              {tc.explanation}
            </p>
          )}
        </div>
      ))}

      <h3 className="mt-4 font-semibold">Starter Code</h3>
      <div className="space-y-2">
        <div>
          <h4 className="font-medium">C++</h4>
          <pre className="bg-gray-100 p-2 rounded">
            {problemData.starterCode.cpp}
          </pre>
        </div>
        <div>
          <h4 className="font-medium">Java</h4>
          <pre className="bg-gray-100 p-2 rounded">
            {problemData.starterCode.java}
          </pre>
        </div>
        <div>
          <h4 className="font-medium">Python</h4>
          <pre className="bg-gray-100 p-2 rounded">
            {problemData.starterCode.python}
          </pre>
        </div>
      </div>

      <h3 className="mt-4 font-semibold">Meta</h3>
      <p>
        <strong>Contest:</strong> {problemData.contestTitle} (ID:{" "}
        {problemData.contestId})
      </p>
      <p>
        <strong>Created by:</strong> {problemData.creatorName}
      </p>
      <p>
        <strong>Order:</strong> {problemData.order}
      </p>
    </div>
  );
};

export default ProblemDetails;
