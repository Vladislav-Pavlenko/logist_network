import axios from "axios";
import { DocumentType, FormValues } from "../types";

export async function generateDocument(
    documentType: DocumentType,
    values: FormValues
): Promise<Blob> {
    const { selectedDocuments, ...data } = values;

    const response = await axios.post<Blob>(
        "/api/generate-selected-documents",
        {
            selectedDocuments: [documentType],
            data,
        },
        {
            responseType: "blob",
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
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}