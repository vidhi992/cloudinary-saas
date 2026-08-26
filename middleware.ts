import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/home",
]);

const isPublicApiRoute = createRouteMatcher([
    "/api/videos",
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    const pathname = req.nextUrl.pathname;

    const isDashboard = pathname === "/home";
    const isApiRequest = pathname.startsWith("/api");

    if (userId && isPublicRoute(req) && !isDashboard) {
        return NextResponse.redirect(
            new URL("/home", req.url)
        );
    }

    if (!userId) {
        if (
            !isPublicRoute(req) &&
            !isPublicApiRoute(req)
        ) {
            if (isApiRequest) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }

            return NextResponse.redirect(
                new URL("/sign-in", req.url)
            );
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!.*\\..*|_next).*)",
        "/",
        "/(api|trpc)(.*)",
    ],
};