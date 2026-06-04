export function sanitizeFileName(value: string): string {
    return value
        .replace(/[<>:"/\\|?*]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}