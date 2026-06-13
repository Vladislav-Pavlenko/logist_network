import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { getCurrentUserFromCookie } from "@/app/lib/auth";
import {
    generateRegistrationCode,
    getRegistrationCodePreview,
    hashRegistrationCode,
} from "@/app/lib/registrationCode";

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUserFromCookie();

        if (!currentUser || currentUser.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Недостатньо прав" },
                { status: 403 }
            );
        }

        const body = await req.json().catch(() => ({}));

        const expiresInDays = body.expiresInDays
            ? Number(body.expiresInDays)
            : null;

        const expiresAt =
            expiresInDays && expiresInDays > 0
                ? new Date(
                    Date.now() +
                    expiresInDays * 24 * 60 * 60 * 1000
                )
                : null;

        let code = "";
        let codeHash = "";

        for (let attempt = 0; attempt < 5; attempt++) {
            code = generateRegistrationCode();
            codeHash = hashRegistrationCode(code);

            const existingCode =
                await prisma.registrationCode.findUnique({
                    where: { codeHash },
                });

            if (!existingCode) {
                break;
            }
        }

        const registrationCode =
            await prisma.registrationCode.create({
                data: {
                    codeHash,
                    codePreview:
                        getRegistrationCodePreview(code),
                    expiresAt,
                    createdById: currentUser.userId,
                },
                select: {
                    id: true,
                    codePreview: true,
                    expiresAt: true,
                    createdAt: true,
                },
            });

        return NextResponse.json({
            message: "Код реєстрації створено",
            code,
            registrationCode,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка створення коду" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const currentUser = await getCurrentUserFromCookie();

        if (!currentUser || currentUser.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Недостатньо прав" },
                { status: 403 }
            );
        }

        const codes = await prisma.registrationCode.findMany({
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                codePreview: true,
                isUsed: true,
                createdAt: true,
                expiresAt: true,
                usedAt: true,
                usedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ codes });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка отримання кодів" },
            { status: 500 }
        );
    }
}