import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "./types/user";

const ROLE_ACCESS: Record<string, UserRole[]> = {
    "/dashboard": [
        UserRole.MANAGER,
        UserRole.DISPATCHER,
        UserRole.SAFETY,
        UserRole.ANALYST,
    ],

    "/vehicles": [
        UserRole.MANAGER,
        UserRole.DISPATCHER,
    ],

    "/drivers": [
        UserRole.MANAGER,
        UserRole.SAFETY,
    ],

    "/trips": [
        UserRole.MANAGER,
        UserRole.DISPATCHER,
    ],

    "/maintenance": [
        UserRole.MANAGER,
        UserRole.SAFETY,
    ],

    "/expenses": [
        UserRole.MANAGER,
        UserRole.ANALYST,
    ],

    "/analytics": [
        UserRole.MANAGER,
        UserRole.ANALYST,
    ],
};

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const userRole = token.role as UserRole;

        const matchedRoute = Object.keys(ROLE_ACCESS).find((route) =>
            path.startsWith(route)
        );

        if (!matchedRoute) {
            return NextResponse.next();
        }

        const allowedRoles = ROLE_ACCESS[matchedRoute];

        if (!allowedRoles.includes(userRole)) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/vehicles/:path*",
        "/drivers/:path*",
        "/trips/:path*",
        "/maintenance/:path*",
        "/expenses/:path*",
        "/analytics/:path*",
    ],
};