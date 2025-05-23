import { getCurrentUser } from "@/auth/currentUser";
import NewProblemForm from "@/components/problems/new-problem-form";
import { redirect } from "next/navigation";
import { useParams } from "next/navigation";

interface PageProps {
  params: {
    contestId: string;
  };
}
export default async function NewProblemPage({ params }: PageProps) {
  const contestId = params.contestId;
  // ** Access the contestId from params

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
