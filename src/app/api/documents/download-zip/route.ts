import { NextRequest, NextResponse } from "next/server";

import { generateZip } from "@/app/api/utils/generateZip";
import { sanitizeFileName } from "@/app/api/utils/sanitizeFileName";
import { getCurrentUserFromCookie } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getFromR2, streamToBuffer } from "@/app/lib/r2";

export const runtime = "nodejs";

type DownloadZipBody = {
    documentIds: string[];
};

type ZipFile = {
    documentType: string;
    fileName: string;
    buffer: Buffer;
};

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUserFromCookie();

        if (!currentUser) {
            return NextResponse.json(
                { message: "Необхідно увійти в акаунт" },
                { status: 401 }
            );
        }

        const body = (await req.json()) as DownloadZipBody;

        if (!Array.isArray(body.documentIds) || body.documentIds.length === 0) {
            return NextResponse.json(
                { message: "Не вибрано жодного документа" },
                { status: 400 }
            );
        }

        const documents = await prisma.transportationDocument.findMany({
            where: {
                id: {
                    in: body.documentIds,
                },
            },
            include: {
                transportationRecord: {
                    select: {
                        id: true,
                        route: true,
                        createdById: true,
                    },
                },
            },
        });

        if (documents.length !== body.documentIds.length) {
            return NextResponse.json(
                { message: "Деякі документи не знайдено" },
                { status: 404 }
            );
        }

        const hasForbiddenDocument = documents.some(
            (document) =>
                currentUser.role !== "ADMIN" &&
                document.transportationRecord.createdById !== currentUser.userId
        );

        if (hasForbiddenDocument) {
            return NextResponse.json(
                { message: "Немає доступу до одного або кількох документів" },
                { status: 403 }
            );
        }

        const filesForZip: ZipFile[] = [];

        for (const document of documents) {
            const r2Object = await getFromR2(document.storageKey);

            if (!r2Object.Body) {
                throw new Error(`Файл ${document.fileName} не знайдено у R2`);
            }

            const buffer = await streamToBuffer(
                r2Object.Body as NodeJS.ReadableStream
            );

            filesForZip.push({
                documentType: document.documentType,
                fileName: document.fileName,
                buffer,
            });
        }

        const zipBuffer = await generateZip(filesForZip);

        const route = documents[0]?.transportationRecord.route || "документи";
        const zipName = sanitizeFileName(`${route} документи.zip`);

        return new NextResponse(new Uint8Array(zipBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
                    zipName
                )}`,
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка створення ZIP-архіву" },
            { status: 500 }
        );
    }
}