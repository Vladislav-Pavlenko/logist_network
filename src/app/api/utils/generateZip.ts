import JSZip from "jszip";

type GeneratedDocument = {
    fileName: string;
    buffer: Buffer;
};

export async function generateZip(
    documents: GeneratedDocument[]
): Promise<Buffer> {
    const zip = new JSZip();

    documents.forEach((document) => {
        zip.file(document.fileName, document.buffer);
    });

    return zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
}