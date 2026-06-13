import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { hashPassword } from "@/app/lib/password";
import { signToken } from "@/app/lib/jwt";
import {
    hashRegistrationCode,
    normalizeRegistrationCode,
} from "@/app/lib/registrationCode";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const name = String(body.name || "").trim();

        const email = String(body.email || "")
            .trim()
            .toLowerCase();

        const password = String(body.password || "");

        const registrationCode =
            normalizeRegistrationCode(
                String(body.registrationCode || "")
            );

        if (!name || !email || !password || !registrationCode) {
            return NextResponse.json(
                { message: "Заповни всі поля" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    message:
                        "Пароль має містити мінімум 6 символів",
                },
                { status: 400 }
            );
        }

        if (registrationCode.length !== 9) {
            return NextResponse.json(
                {
                    message:
                        "Код реєстрації має містити 9 символів",
                },
                { status: 400 }
            );
        }

        const codeHash =
            hashRegistrationCode(registrationCode);

        const result = await prisma.$transaction(
            async (tx) => {
                const code =
                    await tx.registrationCode.findUnique({
                        where: { codeHash },
                    });

                if (!code) {
                    throw new Error(
                        "Невірний код реєстрації"
                    );
                }

                if (code.isUsed) {
                    throw new Error(
                        "Цей код реєстрації вже використано"
                    );
                }

                if (
                    code.expiresAt &&
                    code.expiresAt < new Date()
                ) {
                    throw new Error(
                        "Термін дії коду реєстрації завершився"
                    );
                }

                const existingUser =
                    await tx.user.findUnique({
                        where: { email },
                    });

                if (existingUser) {
                    throw new Error(
                        "Користувач з таким email вже існує"
                    );
                }

                const hashedPassword =
                    await hashPassword(password);

                const user = await tx.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                });

                await tx.registrationCode.update({
                    where: {
                        id: code.id,
                    },
                    data: {
                        isUsed: true,
                        usedAt: new Date(),
                        usedById: user.id,
                    },
                });

                return user;
            }
        );

        const token = await signToken({
            userId: result.id,
            email: result.email,
            role: result.role,
        });

        const response = NextResponse.json({
            message: "Реєстрація успішна",
            user: result,
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Помилка реєстрації",
            },
            { status: 400 }
        );
    }
}