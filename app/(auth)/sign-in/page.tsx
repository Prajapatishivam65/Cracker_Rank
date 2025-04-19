"use client";

import { SignInForm } from "@/components/auth/SignInForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Card className="max-w-md w-full mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-gray-500 dark:text-gray-400">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By signing in, you agree to our
            <Button asChild variant="link" className="p-0 h-auto mx-1 text-xs">
              <Link href="/terms">Terms of Service</Link>
            </Button>
            and
            <Button asChild variant="link" className="p-0 h-auto mx-1 text-xs">
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
