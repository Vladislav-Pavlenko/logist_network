export function createDocumentStorageKey(params: {
    userId: string;
    recordId: string;
    documentId: string;
    fileName: string;
}) {
    const safeFileName = params.fileName
        .replace(/[\\/:*?"<>|]/g, "_")
        .replace(/\s+/g, " ")
        .trim();

    return `users/${params.userId}/records/${params.recordId}/documents/${params.documentId}/${safeFileName}`;
}