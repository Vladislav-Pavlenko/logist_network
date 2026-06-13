import axios from "axios";

import { DocumentData, DocumentType } from "../types";

export async function generateDocument(
    selectedDocuments: DocumentType | DocumentType[],
    data: DocumentData,
    transportationRecordId?: string
): Promise<void> {
    const normalizedSelectedDocuments = Array.isArray(selectedDocuments)
        ? selectedDocuments
        : [selectedDocuments];

    await axios.post(
        "/api/generate-selected-documents",
        {
            selectedDocuments: normalizedSelectedDocuments,
            data,
            transportationRecordId,
        },
        {
            responseType: "blob",
        }
    );
}

export function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}