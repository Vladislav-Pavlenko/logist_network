import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { uploadToR2 } from "@/app/lib/r2";
import { createDocumentStorageKey } from "@/app/lib/storageKey";
import { sanitizeFileName } from "@/app/api/utils/sanitizeFileName";

import { getCurrentUserFromCookie } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
    "docx",
    "pdf",
    "jpg",
    "jpeg",
    "png",
]);

function getExtension(fileName: string) {
    return fileName.split(".").pop()?.toLowerCase() || "";
}

function getContentType(file: File, extension: string) {
    if (file.type) {
        return file.type;
    }

    if (extension === "pdf") {
        return "application/pdf";
    }

    if (extension === "docx") {
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    if (extension === "jpg" || extension === "jpeg") {
        return "image/jpeg";
    }

    if (extension === "png") {
        return "image/png";
    }

    return "application/octet-stream";
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const currentUser = await getCurrentUserFromCookie();

        if (!currentUser) {
            return NextResponse.json(
                { message: "Необхідно увійти в акаунт" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const record = await prisma.transportationRecord.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                createdById: true,
            },
        });

        if (!record) {
            return NextResponse.json(
                { message: "Перевезення не знайдено" },
                { status: 404 }
            );
        }

        if (
            currentUser.role !== "ADMIN" &&
            record.createdById !== currentUser.userId
        ) {
            return NextResponse.json(
                { message: "Немає доступу" },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { message: "Файл не передано" },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { message: "Файл завеликий. Максимум 10 МБ" },
                { status: 400 }
            );
        }

        const extension = getExtension(file.name);

        if (!ALLOWED_EXTENSIONS.has(extension)) {
            return NextResponse.json(
                {
                    message:
                        "Недозволений тип файлу. Доступні: docx, pdf, jpg, jpeg, png",
                },
                { status: 400 }
            );
        }

        const documentId = randomUUID();
        const safeFileName = sanitizeFileName(file.name);
        const contentType = getContentType(file, extension);
        const buffer = Buffer.from(await file.arrayBuffer());

        const storageKey = createDocumentStorageKey({
            userId: currentUser.userId,
            recordId: record.id,
            documentId,
            fileName: safeFileName,
        });

        await uploadToR2({
            key: storageKey,
            body: buffer,
            contentType,
        });

        const document = await prisma.transportationDocument.create({
            data: {
                id: documentId,
                fileName: safeFileName,
                originalFileName: file.name,
                mimeType: contentType,
                size: buffer.byteLength,
                extension,

                storageKey,

                documentType: "uploadedFile",
                source: "UPLOADED",

                transportationRecordId: record.id,
                createdById: currentUser.userId,
            },
            select: {
                id: true,
                fileName: true,
                originalFileName: true,
                mimeType: true,
                size: true,
                extension: true,
                documentType: true,
                source: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        await prisma.transportationRecord.update({
            where: {
                id: record.id,
            },
            data: {
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            message: "Файл завантажено",
            document,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка завантаження файлу" },
            { status: 500 }
        );
    }
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

        const record = await prisma.transportationRecord.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                createdById: true,
            },
        });

        if (!record) {
            return NextResponse.json(
                { message: "Перевезення не знайдено" },
                { status: 404 }
            );
        }

        if (
            currentUser.role !== "ADMIN" &&
            record.createdById !== currentUser.userId
        ) {
            return NextResponse.json(
                { message: "Немає доступу" },
                { status: 403 }
            );
        }

        const documents = await prisma.transportationDocument.findMany({
            where: {
                transportationRecordId: id,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                fileName: true,
                originalFileName: true,
                mimeType: true,
                size: true,
                extension: true,
                documentType: true,
                source: true,
                createdAt: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({
            documents,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка отримання документів" },
            { status: 500 }
        );
    }
}