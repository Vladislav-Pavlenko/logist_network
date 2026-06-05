export function formatDateWithYearMarker(value: string): string {
    const cleanValue = value.trim();

    if (!cleanValue) return "";

    return cleanValue.replace(
        /(\d{2}\.\d{2}\.\d{4})(?!\s*р\.?)/g,
        "$1 р."
    );
}