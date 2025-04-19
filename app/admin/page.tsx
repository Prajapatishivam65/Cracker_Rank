import { ContestForm } from "@/components/contest/contest-form";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create Coding Contest</h1>
      <ContestForm />
    </div>
  );
}
