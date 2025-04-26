import { NextResponse, type NextRequest } from "next/server";
import {
  getUserFromSession,
  updateUserSessionExpiration,
} from "./lib/core/session";

const privateRoutes = ["/private"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const response = (await middlewareAuth(request)) ?? NextResponse.next();

  // Always update session expiration, even if redirected
  await updateUserSessionExpiration({
    set: (key, value, options) => {
      response.cookies.set({ ...options, name: key, value });
    },
    get: (key) => request.cookies.get(key),
  });

  return response;
}

async function middlewareAuth(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPrivate = privateRoutes.some((path) => pathname.startsWith(path));
  const isAdmin = adminRoutes.some((path) => pathname.startsWith(path));

  if (isPrivate || isAdmin) {
    const user = await getUserFromSession(request.cookies);

    if (user == null) {
      // Not logged in -> redirect to sign-in
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (isAdmin && user.role !== "admin") {
      // Logged in but not admin -> redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If no redirect is needed, return undefined (middleware continues normally)
}

export const config = {
  matcher: [
    // Protect everything except _next, static files, and assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
