import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("R2 environment variables are not configured");
}

export const r2BucketName = bucketName;

export const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

type UploadToR2Params = {
    key: string;
    body: Buffer | Uint8Array;
    contentType: string;
};

export async function uploadToR2({
                                     key,
                                     body,
                                     contentType,
                                 }: UploadToR2Params) {
    await r2Client.send(
        new PutObjectCommand({
            Bucket: r2BucketName,
            Key: key,
            Body: body,
            ContentType: contentType,
        })
    );
}

export function getFromR2(key: string) {
    return r2Client.send(
        new GetObjectCommand({
            Bucket: r2BucketName,
            Key: key,
        })
    );
}

export async function deleteFromR2(key: string) {
    await r2Client.send(
        new DeleteObjectCommand({
            Bucket: r2BucketName,
            Key: key,
        })
    );
}

export async function streamToBuffer(
    stream: NodeJS.ReadableStream
): Promise<Buffer> {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
}