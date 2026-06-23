import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromCookie } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUserFromCookie();

        if (!currentUser || currentUser.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Доступ заборонено. Потрібні права адміністратора" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { targetEmail, newPassword } = body;

        if (!targetEmail || !newPassword) {
            return NextResponse.json(
                { message: "Заповніть усі поля" },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { message: "Новий пароль має бути не менше 6 символів" },
                { status: 400 }
            );
        }

        const targetUser = await prisma.user.findUnique({
            where: { email: targetEmail },
        });

        if (!targetUser) {
            return NextResponse.json(
                { message: "Користувача з таким email не знайдено" },
                { status: 404 }
            );
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: targetUser.id },
            data: { password: hashedNewPassword },
        });

        return NextResponse.json({
            message: "Пароль успішно змінено",
        });
    } catch (error) {
        return NextResponse.json(
            { message: "Внутрішня помилка сервера" },
            { status: 500 }
        );
    }
}