import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLogin = req.nextUrl.pathname === "/login";
  const isApiAuth = req.nextUrl.pathname.startsWith("/api/auth");
  const isWebhook = req.nextUrl.pathname.startsWith("/api/webhooks");

  // Allow auth API routes and webhooks through
  if (isApiAuth || isWebhook) return;

  // Redirect logged-in users away from login page
  if (isOnLogin && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isOnLogin) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
