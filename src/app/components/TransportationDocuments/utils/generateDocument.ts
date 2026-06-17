import axios from "axios";

import { DocumentData, DocumentType } from "../types";

type GenerateDocumentResponse = {
    message: string;
    recordId: string;
    documents: {
        id: string;
        fileName: string;
        documentType: string;
    }[];
};

export async function generateDocument(
    selectedDocuments: DocumentType | DocumentType[],
    data: DocumentData,
    transportationRecordId?: string
): Promise<GenerateDocumentResponse> {
    const normalizedSelectedDocuments = Array.isArray(selectedDocuments)
        ? selectedDocuments
        : [selectedDocuments];

    const response = await axios.post<GenerateDocumentResponse>(
        "/api/generate-selected-documents",
        {
            selectedDocuments: normalizedSelectedDocuments,
            data,
            transportationRecordId,
        }
    );

    return response.data;
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