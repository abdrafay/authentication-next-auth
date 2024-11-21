// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";
// export {default} from 'next-auth/middleware'

// export async function middleware(request: NextRequest) { 
//     const token = await getToken({ req: request })
//     const url = request.nextUrl

//     if (token && (url.pathname.startsWith('/auth/signin') || url.pathname.startsWith('/auth/signup') || url.pathname.startsWith('/verify'))) {
//         // url.pathname.startsWith('/dashboard') && token.role === 'student' && NextResponse.redirect(new URL('/student', request.url))
//         return NextResponse.redirect(new URL('/home', request.url))
//     }
// }

// export const config = {
//     matcher: [
//         // at singin and singup and /dashboard
//         "/api/auth/signin",
//         "/api/auth/signup",
//         // at signout
//         "/api/auth/signout",
//         "/",
//         '/dashboard/:path*',
//         '/verify/:path*',
//     ]
// }

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const url = request.nextUrl;

    if (!token) {
        // Redirect unauthenticated users to the login page, except for public routes
        if (!url.pathname.startsWith('/auth') && !url.pathname.startsWith('/public')) {
            return NextResponse.redirect(new URL('/auth/signin', request.url));
        }
        return NextResponse.next();
    }

    // Extract role from the token
    const { role } = token as { role: string };

    // Define role-based access rules
    const roleBasedPaths: Record<string, RegExp> = {
        student: /^\/student(?:\/|$)/,
        teacher: /^\/teacher(?:\/|$)/,
        admin: /^\/admin(?:\/|$)/,
    };

    // Ensure the user's role matches the allowed paths
    const allowedPathRegex = roleBasedPaths[role];
    if (allowedPathRegex && !allowedPathRegex.test(url.pathname)) {
        // Redirect to the user's homepage if accessing an unauthorized route
        return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    // Prevent authenticated users from accessing auth routes
    if (
        url.pathname.startsWith('/auth/signin') || 
        url.pathname.startsWith('/auth/signup') || 
        url.pathname.startsWith('/verify')
    ) {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/student/:path*",
        "/teacher/:path*",
        "/admin/:path*",
        "/auth/:path*",
        "/dashboard/:path*",
        "/verify/:path*",
    ],
};
