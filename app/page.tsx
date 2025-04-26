import { LogOutButton } from "@/components/auth/LogOutButton";
import { getCurrentUser } from "@/auth/currentUser";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Header from "@/components/custom/Header";

export default async function HomePage() {
  // const fullUser = await getCurrentUser({ withFullUser: true });
  const fullUser = await getCurrentUser({ withFullUser: true });
  // const fullUser = { id: "123", name: "John Doe", role: "admin" }; // Mocked user data for demonstration

  return (
    <>
      {/* <Header /> */}
      <div className="container mx-auto p-4">
        {fullUser == null ? (
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        ) : (
          <Card className="max-w-[500px] mt-4">
            <CardHeader>
              <CardTitle>User: {fullUser.name}</CardTitle>
              <CardDescription>Name: {fullUser.email}</CardDescription>
              <CardDescription>Role: {fullUser.role}</CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-4">
              <Button asChild variant="outline">
                <Link href="/private">Private Page</Link>
              </Button>
              {fullUser.role === "admin" && (
                <Button asChild variant="outline">
                  <Link href="/admin">Admin Page</Link>
                </Button>
              )}
              <LogOutButton />
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
}
