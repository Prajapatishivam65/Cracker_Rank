/**
 * Session Management System
 *
 * This module handles all aspects of user session management including:
 * - Session creation, retrieval, and deletion
 * - Cookie management
 * - Redis storage for session data
 */

import { userRoles } from "@/drizzle/schema";
import { z } from "zod";
import { cookies } from "next/headers";
import crypto from "crypto";
import { redisClient } from "@/redis/redis";

// --------------------------
// Constants and Type Definitions
// --------------------------

/**
 * Session duration in milliseconds (7 days)
 */
const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7;

/**
 * Name of the cookie that stores the session ID
 */
const SESSION_COOKIE_NAME = "my super Sceret sessionId";

/**
 * Zod schema for validating session data
 */
const sessionSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(userRoles),
});

/**
 * Represents a browser cookie
 */
export type Cookie = {
  name: string;
  value: string;
};

/**
 * Interface for cookie operations
 */
export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires?: Date;
    }
  ) => void;
  get: (key: string) => Cookie | undefined;
  delete: (key: string) => void;
};

/**
 * User session data structure
 */
export type UserSession = z.infer<typeof sessionSchema>;

// --------------------------
// Session Core Functions
// --------------------------

/**
 * Retrieves a user's session from cookies
 *
 * @param cookies - Object containing cookie getter
 * @returns User session data or null if no valid session exists
 */
export async function getUserFromSession(
  cookies: Pick<Cookies, "get">
): Promise<UserSession | null> {
  const sessionCookie = cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) return null;

  return await getUserSessionById(sessionCookie.value);
}

/**
 * Creates a new user session and stores it in Redis
 *
 * @param user - User data to store in the session
 * @param cookies - Cookie operations object
 */
export async function createUserSession(
  user: Pick<UserSession, "id" | "email" | "role">,
  cookies: Cookies
): Promise<void> {
  // Generate a secure random session ID
  const sessionId = crypto.randomBytes(64).toString("hex");

  // Validate and sanitize the user data
  const sessionData = sessionSchema.parse(user);

  // Store session in Redis with expiration
  await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), {
    ex: Math.floor(SESSION_EXPIRATION_TIME / 1000),
  });

  // Set the session cookie in the browser
  await setCookie(sessionId, cookies);
}

/**
 * Updates existing session data in Redis
 *
 * @param user - Updated user data
 * @param cookies - Object containing cookie getter
 * @returns null if session doesn't exist
 */
export async function updateUserSessionData(
  user: UserSession,
  cookies: Pick<Cookies, "get">
): Promise<null | void> {
  const sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  // Update the session data in Redis with the same expiration
  await redisClient.set(`session:${sessionId}`, JSON.stringify(user), {
    ex: Math.floor(SESSION_EXPIRATION_TIME / 1000),
  });
}

/**
 * Extends the expiration time of an existing session
 *
 * @param cookies - Object containing cookie getter and setter
 * @returns null if session doesn't exist
 */
export async function updateUserSessionExpiration(
  cookies: Pick<Cookies, "get" | "set">
): Promise<null | void> {
  const sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const user = await getUserSessionById(sessionId);
  if (!user) return null;

  // Reset the expiration time in Redis
  await redisClient.set(`session:${sessionId}`, JSON.stringify(user), {
    ex: Math.floor(SESSION_EXPIRATION_TIME / 1000),
  });

  // Update the cookie expiration as well
  await setCookie(sessionId, cookies);
}

/**
 * Removes a user session from both Redis and cookies
 *
 * @param cookies - Cookie operations object
 */
export async function removeUserFromSession(cookies: Cookies): Promise<void> {
  const sessionCookie = cookies.get(SESSION_COOKIE_NAME);
  if (sessionCookie) {
    // Delete the session from Redis
    await redisClient.del(`session:${sessionCookie.value}`);
  }
  // Remove the session cookie
  cookies.delete(SESSION_COOKIE_NAME);
}

// --------------------------
// Helper Functions
// --------------------------

/**
 * Sets a session cookie with secure settings
 *
 * @param sessionId - Session ID to store in the cookie
 * @param cookies - Cookie setter object
 */
export async function setCookie(
  sessionId: string,
  cookies: Pick<Cookies, "set">
): Promise<void> {
  cookies.set(SESSION_COOKIE_NAME, sessionId, {
    secure: true, // HTTPS only
    httpOnly: true, // Not accessible via JavaScript
    sameSite: "lax", // Reasonable CSRF protection while maintaining functionality
    expires: new Date(Date.now() + SESSION_EXPIRATION_TIME),
  });
}

/**
 * Retrieves session data from Redis by session ID
 *
 * @param sessionId - ID of the session to retrieve
 * @returns Parsed user session data or null
 */
async function getUserSessionById(
  sessionId: string
): Promise<UserSession | null> {
  try {
    // Get raw session data from Redis
    const rawUser = await redisClient.get(`session:${sessionId}`);
    if (!rawUser) return null;

    // Handle parsing based on the type of data returned
    let parsedUser: unknown;

    if (typeof rawUser === "string") {
      try {
        parsedUser = JSON.parse(rawUser);
      } catch (e) {
        console.error("Error parsing session data:", e);
        return null;
      }
    } else {
      // If Redis client already parsed the JSON, use it directly
      parsedUser = rawUser;
    }

    // Validate the structure of the session data
    const { success, data } = sessionSchema.safeParse(parsedUser);
    return success ? data : null;
  } catch (error) {
    console.error("Error retrieving user session:", error);
    return null;
  }
}
