import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { comparePassword } from "@/app/lib/password";
import { signToken } from "@/app/lib/jwt";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const email = String(body.email || "")
            .trim()
            .toLowerCase();
        const password = String(body.password || "");

        if (!email || !password) {
            return NextResponse.json(
                { message: "Введи email і пароль" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Невірний email або пароль" },
                { status: 401 }
            );
        }

        const isPasswordValid = await comparePassword(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Невірний email або пароль" },
                { status: 401 }
            );
        }

        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const response = NextResponse.json({
            message: "Вхід виконано",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
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
            { message: "Помилка входу" },
            { status: 500 }
        );
    }
}