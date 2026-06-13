import { NextResponse } from "next/server";

import { getCurrentUserFromCookie } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
    const payload = await getCurrentUserFromCookie();

    if (!payload) {
        return NextResponse.json(
            { user: null },
            { status: 401 }
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            id: payload.userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    if (!user) {
        return NextResponse.json(
            { user: null },
            { status: 401 }
        );
    }

    return NextResponse.json({ user });
}