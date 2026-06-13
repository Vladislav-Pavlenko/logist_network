import { randomUUID } from "crypto";

import { Prisma } from "@/generated/prisma";

import { prisma } from "@/app/lib/prisma";
import { deleteFromR2, uploadToR2 } from "@/app/lib/r2";
import { createDocumentStorageKey } from "@/app/lib/storageKey";
import { AuthPayload } from "@/app/lib/jwt";

import { DocumentData } from "./documentTypes";

type GeneratedDocumentForStorage = {
    documentType: string;
    fileName: string;
    buffer: Buffer | Uint8Array;
};

type SaveGeneratedDocumentsToStorageParams = {
    transportationRecordId?: string;
    generatedDocuments: GeneratedDocumentForStorage[];
    data: DocumentData;
    currentUser: AuthPayload;
};

function toNullableString(value: unknown) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim();

    return trimmedValue || null;
}

function getExtension(fileName: string) {
    const parts = fileName.split(".");
    const extension = parts.length > 1 ? parts.pop() : null;

    return extension?.toLowerCase() || null;
}

async function createOrUpdateTransportationRecord({
                                                      transportationRecordId,
                                                      data,
                                                      currentUser,
                                                  }: {
    transportationRecordId?: string;
    data: DocumentData;
    currentUser: AuthPayload;
}) {
    const recordData = {
        title: toNullableString(data.route),
        route: toNullableString(data.route),
        customerCompany:
            toNullableString(data.customerCompany) ||
            toNullableString(data.transportCostsCustomerCompany),
        carrierCompany: toNullableString(data.carrierCompany),
        vehicleDetails:
            toNullableString(data.vehicleDetails) ||
            toNullableString(data.transportCostsVehicle),
        cargoDetails: toNullableString(data.cargoDetails),
        formData: data as unknown as Prisma.InputJsonValue,
    };

    if (!transportationRecordId) {
        return prisma.transportationRecord.create({
            data: {
                ...recordData,
                createdById: currentUser.userId,
            },
        });
    }

    const existingRecord =
        await prisma.transportationRecord.findUnique({
            where: {
                id: transportationRecordId,
            },
        });

    if (!existingRecord) {
        throw new Error("Перевезення не знайдено");
    }

    if (
        currentUser.role !== "ADMIN" &&
        existingRecord.createdById !== currentUser.userId
    ) {
        throw new Error("Немає доступу до цього перевезення");
    }

    return prisma.transportationRecord.update({
        where: {
            id: transportationRecordId,
        },
        data: recordData,
    });
}

async function findOldGeneratedDocuments(params: {
    transportationRecordId: string;
    documentTypes: string[];
}) {
    if (params.documentTypes.length === 0) {
        return [];
    }

    return prisma.transportationDocument.findMany({
        where: {
            transportationRecordId: params.transportationRecordId,
            documentType: {
                in: params.documentTypes,
            },
            source: "GENERATED",
        },
        select: {
            id: true,
            storageKey: true,
            documentType: true,
            fileName: true,
        },
    });
}

async function deleteOldGeneratedDocuments(
    oldDocuments: {
        id: string;
        storageKey: string;
    }[]
) {
    if (oldDocuments.length === 0) {
        return;
    }

    for (const document of oldDocuments) {
        await deleteFromR2(document.storageKey);
    }

    await prisma.transportationDocument.deleteMany({
        where: {
            id: {
                in: oldDocuments.map((document) => document.id),
            },
        },
    });
}

export async function saveGeneratedDocumentsToStorage({
                                                          transportationRecordId,
                                                          generatedDocuments,
                                                          data,
                                                          currentUser,
                                                      }: SaveGeneratedDocumentsToStorageParams) {
    const record = await createOrUpdateTransportationRecord({
        transportationRecordId,
        data,
        currentUser,
    });

    const oldGeneratedDocuments = transportationRecordId
        ? await findOldGeneratedDocuments({
            transportationRecordId: record.id,
            documentTypes: generatedDocuments.map(
                (document) => document.documentType
            ),
        })
        : [];

    const savedDocuments = [];

    for (const document of generatedDocuments) {
        const documentId = randomUUID();
        const buffer = Buffer.from(document.buffer);

        const storageKey = createDocumentStorageKey({
            userId: currentUser.userId,
            recordId: record.id,
            documentId,
            fileName: document.fileName,
        });

        await uploadToR2({
            key: storageKey,
            body: buffer,
            contentType:
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        const savedDocument =
            await prisma.transportationDocument.create({
                data: {
                    id: documentId,
                    fileName: document.fileName,
                    originalFileName: document.fileName,
                    mimeType:
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    size: buffer.byteLength,
                    extension: getExtension(document.fileName),

                    storageKey,

                    documentType: document.documentType,
                    source: "GENERATED",

                    transportationRecordId: record.id,
                    createdById: currentUser.userId,
                },
            });

        savedDocuments.push(savedDocument);
    }

    await deleteOldGeneratedDocuments(oldGeneratedDocuments);

    return {
        record,
        documents: savedDocuments,
    };
}