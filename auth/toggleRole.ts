"use server";

import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getCurrentUser } from "./currentUser";
import { updateUserSessionData } from "@/lib/core/session";

export async function toggleRole() {
  const user = await getCurrentUser({ redirectIfNotFound: true });

  const [updatedUser] = await db
    .update(UserTable)
    .set({ role: user.role === "admin" ? "user" : "admin" })
    .where(eq(UserTable.id, user.id))
    .returning({
      id: UserTable.id,
      email: UserTable.email,
      role: UserTable.role,
    });

  await updateUserSessionData(updatedUser, await cookies());
}
