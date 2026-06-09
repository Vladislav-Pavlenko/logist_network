export function formatDocumentDate(
    value: string
): string {
    const cleanValue = value.trim();

    if (!cleanValue) {
        return "";
    }

    const match = cleanValue.match(
        /^(\d{2})\.(\d{2})\.(\d{2}|\d{4})$/
    );

    if (!match) {
        return cleanValue;
    }

    const months: Record<string, string> = {
        "01": "січня",
        "02": "лютого",
        "03": "березня",
        "04": "квітня",
        "05": "травня",
        "06": "червня",
        "07": "липня",
        "08": "серпня",
        "09": "вересня",
        "10": "жовтня",
        "11": "листопада",
        "12": "грудня",
    };

    const [, day, month, yearValue] = match;

    const fullYear =
        yearValue.length === 2
            ? `20${yearValue}`
            : yearValue;

    return `«${day}» ${months[month] || month} ${fullYear} р.`;
}