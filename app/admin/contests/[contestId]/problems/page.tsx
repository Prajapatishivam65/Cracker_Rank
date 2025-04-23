import { getCurrentUser } from "@/auth/currentUser";
import NewProblemForm from "@/components/problems/new-problem-form";
import { redirect } from "next/navigation";

export default async function NewProblemPage() {
  const contestId = "3e052d58-78da-4f70-9e4e-5b2c2cfde719"; // Todo Placeholder, replace with actual logic to get contestId

  // Get current user server-side
  const user = await getCurrentUser({ withFullUser: true });

  // If no user is found, redirect to login
  if (!user) {
    redirect("/login"); // Adjust this path to your login route
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">Add New Problem</h1>
      <p className="mb-6 text-gray-600">
        Creating problem for Contest ID: {contestId}
      </p>
      <NewProblemForm contestId={contestId} userId={user.id} />
    </div>
  );
}
