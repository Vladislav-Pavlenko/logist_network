import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import sanitizeHtml from "sanitize-html";

import { getCurrentUserFromCookie } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getFromR2, streamToBuffer } from "@/app/lib/r2";

export const runtime = "nodejs";

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

function isDocxFile(mimeType: string, extension: string | null) {
    return (
        mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        extension === "docx"
    );
}

function createHtmlPage(content: string, fileName: string) {
    return `
        <!doctype html>
        <html lang="uk">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>${fileName}</title>
                <style>
                    body {
                        margin: 0;
                        padding: 32px;
                        background: #f3f4f6;
                        font-family: Arial, sans-serif;
                        color: #111827;
                    }

                    .document {
                        max-width: 900px;
                        margin: 0 auto;
                        padding: 40px;
                        background: #ffffff;
                        border-radius: 14px;
                        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
                    }

                    .document h1,
                    .document h2,
                    .document h3 {
                        margin-top: 24px;
                        color: #111827;
                    }

                    .document p {
                        line-height: 1.55;
                    }

                    .document table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 18px 0;
                    }

                    .document td,
                    .document th {
                        border: 1px solid #d1d5db;
                        padding: 8px;
                        vertical-align: top;
                    }

                    .document img {
                        max-width: 100%;
                        height: auto;
                    }

                    @media print {
                        body {
                            padding: 0;
                            background: #ffffff;
                        }

                        .document {
                            box-shadow: none;
                            border-radius: 0;
                        }
                    }
                </style>
            </head>

            <body>
                <main class="document">
                    ${content}
                </main>
            </body>
        </html>
    `;
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

        if (!isDocxFile(document.mimeType, document.extension)) {
            return NextResponse.json(
                { message: "Цей файл не є DOCX" },
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

        const result = await mammoth.convertToHtml({
            buffer,
        });

        const safeHtml = sanitizeHtml(result.value, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                "img",
                "table",
                "thead",
                "tbody",
                "tr",
                "th",
                "td",
            ]),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ["src", "alt"],
                "*": ["style"],
            },
        });

        const page = createHtmlPage(safeHtml, document.fileName);

        return new NextResponse(page, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка перегляду DOCX" },
            { status: 500 }
        );
    }
}