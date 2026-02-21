import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { UserRole } from './types/user';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Protection logic
        if (!token && path !== '/login') {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Role-based access control
        if (path.startsWith('/analytics') && token?.role !== UserRole.MANAGER && token?.role !== UserRole.ANALYST) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        if (path.startsWith('/trips/create') && token?.role === UserRole.ANALYST) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        if (path.startsWith('/expenses/modify') && token?.role === UserRole.SAFETY) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/login',
        },
    }
);

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/vehicles/:path*',
        '/drivers/:path*',
        '/trips/:path*',
        '/maintenance/:path*',
        '/expenses/:path*',
        '/analytics/:path*',
    ],
};
