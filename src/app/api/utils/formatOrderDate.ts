export function formatOrderDate(value: string): string {
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

    const cleanValue = value.trim();

    const match = cleanValue.match(
        /^(\d{2})\.(\d{2})\.(\d{2}|\d{4})(?:-(\d+))?$/
    );

    if (!match) {
        return cleanValue;
    }

    const [, day, month, yearValue, orderNumber] = match;

    const fullYear = yearValue.length === 2 ? `20${yearValue}` : yearValue;
    const shortYear = fullYear.slice(-2);
    const monthName = months[month] || month;

    const orderSuffix = orderNumber ? `-${orderNumber}` : "";

    return `№${shortYear}/${month}/${day}${orderSuffix} від «${day}» ${monthName} ${fullYear} р.`;
}