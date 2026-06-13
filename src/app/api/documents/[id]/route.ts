import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserFromCookie } from "@/app/lib/auth";
import { deleteFromR2 } from "@/app/lib/r2";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const currentUser = await getCurrentUserFromCookie();

        if (!currentUser) {
            return NextResponse.json(
                { message: "Необхідно увійти в акаунт" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const document = await prisma.transportationDocument.findUnique({
            where: {
                id,
            },
            include: {
                transportationRecord: {
                    select: {
                        id: true,
                        createdById: true,
                    },
                },
            },
        });

        if (!document) {
            return NextResponse.json(
                { message: "Документ не знайдено" },
                { status: 404 }
            );
        }

        if (
            currentUser.role !== "ADMIN" &&
            document.transportationRecord.createdById !== currentUser.userId
        ) {
            return NextResponse.json(
                { message: "Немає доступу" },
                { status: 403 }
            );
        }

        await deleteFromR2(document.storageKey);

        await prisma.transportationDocument.delete({
            where: {
                id,
            },
        });

        await prisma.transportationRecord.update({
            where: {
                id: document.transportationRecordId,
            },
            data: {
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            message: "Документ видалено",
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка видалення документа" },
            { status: 500 }
        );
    }
}