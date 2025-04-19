"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { oAuthSignIn, signIn } from "@/lib/auth";
import { Checkbox } from "@/components/ui/checkbox";

// Define the validation schema
const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional(),
});

export function SignInForm() {
  const [error, setError] = useState<string>();

  const form = useForm<z.infer<typeof signInSchema>>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof signInSchema>) {
    console.log("Form submitted:", data);

    const error = await signIn(data);
    if (error) {
      setError(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            // onClick={async () => await oAuthSignIn("discord")}
          >
            Discord
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            // onClick={async () => await oAuthSignIn("github")}
          >
            GitHub
          </Button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-primary-500"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500 dark:text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Password
                </FormLabel>
                <Button variant="link" asChild className="p-0 h-auto text-xs">
                  <Link href="/forgot-password" className="text-primary">
                    Forgot password?
                  </Link>
                </Button>
              </div>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-primary-500"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500 dark:text-red-400" />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2 pt-2">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 text-white"
          >
            Sign In
          </Button>
          <div className="text-sm text-center mt-2 text-gray-600 dark:text-gray-400">
            Don't have an account yet?{" "}
            <Button
              asChild
              variant="link"
              className="p-0 text-primary dark:text-primary"
            >
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
