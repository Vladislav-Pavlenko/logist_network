import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/app/lib/jwt";

const protectedRoutes = ["/documents", "/admin"];
const publicRoutes = ["/login", "/register"];

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = req.cookies.get("token")?.value;

    const payload = token ? await verifyToken(token) : null;

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
    );

    const isAdminRoute = pathname.startsWith("/admin");

    if (isProtectedRoute && !payload) {
        const loginUrl = new URL("/login", req.url);

        return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute && payload?.role !== "ADMIN") {
        const documentsUrl = new URL("/documents", req.url);

        return NextResponse.redirect(documentsUrl);
    }

    if (isPublicRoute && payload) {
        const documentsUrl = new URL("/documents", req.url);

        return NextResponse.redirect(documentsUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/documents",
        "/documents/:path*",
        "/admin",
        "/admin/:path*",
        "/login",
        "/register",
    ],
};