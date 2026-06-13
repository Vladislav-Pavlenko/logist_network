import { createHash, randomBytes } from "crypto";

const CODE_LENGTH = 9;

const CODE_CHARS =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeRegistrationCode(code: string) {
    return code
        .trim()
        .replace(/[\s-]/g, "")
        .toUpperCase();
}

export function generateRegistrationCode() {
    const bytes = randomBytes(CODE_LENGTH);

    let code = "";

    for (let i = 0; i < CODE_LENGTH; i++) {
        code += CODE_CHARS[bytes[i] % CODE_CHARS.length];
    }

    return code;
}

export function hashRegistrationCode(code: string) {
    const normalizedCode = normalizeRegistrationCode(code);

    return createHash("sha256")
        .update(normalizedCode)
        .digest("hex");
}

export function getRegistrationCodePreview(code: string) {
    const normalizedCode = normalizeRegistrationCode(code);

    return `${normalizedCode.slice(0, 3)}***${normalizedCode.slice(-2)}`;
}