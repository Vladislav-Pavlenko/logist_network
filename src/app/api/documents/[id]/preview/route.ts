import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserFromCookie } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getFromR2, streamToBuffer } from "@/app/lib/r2";

export const runtime = "nodejs";

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

function canPreview(mimeType: string) {
    return (
        mimeType === "application/pdf" ||
        mimeType.startsWith("image/")
    );
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
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
            where: { id },
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

        if (!canPreview(document.mimeType)) {
            return NextResponse.json(
                { message: "Цей тип файлу не підтримує перегляд" },
                { status: 400 }
            );
        }

        const r2Object = await getFromR2(document.storageKey);

        if (!r2Object.Body) {
            return NextResponse.json(
                { message: "Файл у сховищі порожній" },
                { status: 404 }
            );
        }

        const buffer = await streamToBuffer(
            r2Object.Body as NodeJS.ReadableStream
        );

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": document.mimeType,
                "Content-Length": String(buffer.byteLength),
                "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(
                    document.fileName
                )}`,
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка перегляду документа" },
            { status: 500 }
        );
    }
}