import { NextRequest, NextResponse } from "next/server";

import { documentConfigs } from "@/app/api/utils/documentConfigs";
import { GenerateDocumentsBody } from "@/app/api/utils/documentTypes";
import { generateDocxFromTemplate } from "@/app/api/utils/generateDocxFromTemplate";
import { generateZip } from "@/app/api/utils/generateZip";
import { sanitizeFileName } from "@/app/api/utils/sanitizeFileName";
import { validateGenerateDocumentsRequest } from "@/app/api/utils/validateGenerateDocumentsRequest";

export async function POST(req: NextRequest) {
    try {
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

            const buffer = generateDocxFromTemplate(config.templateName, data);

            return {
                fileName: sanitizeFileName(config.outputName(data)),
                buffer,
            };
        });

        if (generatedDocuments.length === 1) {
            const document = generatedDocuments[0];

            return new NextResponse(new Uint8Array(document.buffer), {
                status: 200,
                headers: {
                    "Content-Type":
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
                        document.fileName
                    )}`,
                },
            });
        }

        const zipBuffer = await generateZip(generatedDocuments);

        const zipName = sanitizeFileName(
            `Документи ${data.route} ${data.orderDate || data.actDate}.zip`
        );

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
            { message: "Помилка генерації документів" },
            { status: 500 }
        );
    }
}