import NewProblemForm from "@/components/problems/new-problem-form";

export default function NewProblemPage() {
  const contestId = "3e052d58-78da-4f70-9e4e-5b2c2cfde719"; // Todo Placeholder, replace with actual logic to get contestId
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">Add New Problem</h1>
      <p className="mb-6 text-gray-600">
        Creating problem for Contest ID: {contestId}
      </p>
      <NewProblemForm contestId={contestId} />
    </div>
  );
}
