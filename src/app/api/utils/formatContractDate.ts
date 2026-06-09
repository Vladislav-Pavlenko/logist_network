export type FormattedContractDate = {
    numeric: string;
    text: string;
};

export function formatContractDate(
    value: string
): FormattedContractDate {
    const cleanValue = value.trim();

    if (!cleanValue) {
        return {
            numeric: "",
            text: "",
        };
    }

    const match = cleanValue.match(
        /^(\d{2})\.(\d{2})\.(\d{2}|\d{4})$/
    );

    if (!match) {
        return {
            numeric: cleanValue,
            text: cleanValue,
        };
    }

    const months: Record<string, string> = {
        "01": "Січня",
        "02": "Лютого",
        "03": "Березня",
        "04": "Квітня",
        "05": "Травня",
        "06": "Червня",
        "07": "Липня",
        "08": "Серпня",
        "09": "Вересня",
        "10": "Жовтня",
        "11": "Листопада",
        "12": "Грудня",
    };

    const [, day, month, yearValue] = match;

    const fullYear =
        yearValue.length === 2
            ? `20${yearValue}`
            : yearValue;

    return {
        numeric: `${day}/${month}/${fullYear}`,
        text: `«${day}» ${months[month] || month} ${fullYear} р.`,
    };
}