import { NextRequest, NextResponse } from "next/server";

import { documentConfigs } from "@/app/api/utils/documentConfigs";
import { GenerateDocumentsBody } from "@/app/api/utils/documentTypes";
import { generateDocxFromTemplate } from "@/app/api/utils/generateDocxFromTemplate";
import { sanitizeFileName } from "@/app/api/utils/sanitizeFileName";
import { validateGenerateDocumentsRequest } from "@/app/api/utils/validateGenerateDocumentsRequest";
import { saveGeneratedDocumentsToStorage } from "@/app/api/utils/saveGeneratedDocumentsToStorage";
import { getCurrentUserFromCookie } from "@/app/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUserFromCookie();

        if (!currentUser) {
            return NextResponse.json(
                { message: "Необхідно увійти в акаунт" },
                { status: 401 }
            );
        }

        const body = (await req.json()) as GenerateDocumentsBody;

        const validationError = validateGenerateDocumentsRequest(body);

        if (validationError) {
            return NextResponse.json(
                { message: validationError },
                { status: 400 }
            );
        }

        const { selectedDocuments, data } = body;

        const generatedDocuments = selectedDocuments.map((documentType) => {
            const config = documentConfigs[documentType];

            if (!config) {
                throw new Error(`Невідомий тип документа: ${documentType}`);
            }

            const buffer = generateDocxFromTemplate(
                config.templateName,
                data
            );

            return {
                documentType,
                fileName: sanitizeFileName(config.outputName(data)),
                buffer,
            };
        });

        const storageResult = await saveGeneratedDocumentsToStorage({
            transportationRecordId: body.transportationRecordId,
            generatedDocuments,
            data,
            currentUser,
        });

        return NextResponse.json({
            message: "Документи згенеровано та збережено",
            recordId: storageResult.record.id,
            documents: storageResult.documents.map((document) => ({
                id: document.id,
                fileName: document.fileName,
                documentType: document.documentType,
            })),
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Помилка генерації документів",
            },
            { status: 500 }
        );
    }
}