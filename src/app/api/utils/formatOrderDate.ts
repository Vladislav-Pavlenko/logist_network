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

    const ukrainianMatch = cleanValue.match(
        /^(\d{2})\.(\d{2})\.(\d{2}|\d{4})(?:-(\d+))?$/
    );

    if (ukrainianMatch) {
        const [, day, month, yearValue, orderNumber] = ukrainianMatch;

        const fullYear = yearValue.length === 2 ? `20${yearValue}` : yearValue;
        const shortYear = fullYear.slice(-2);
        const monthName = months[month] || month;
        const orderSuffix = orderNumber ? `-${orderNumber}` : "";

        return `№${day}/${month}/${shortYear}${orderSuffix} від «${day}» ${monthName} ${fullYear} р.`;
    }

    const isoMatch = cleanValue.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:-(\d+))?$/
    );

    if (isoMatch) {
        const [, year, month, day, orderNumber] = isoMatch;

        const shortYear = year.slice(-2);
        const monthName = months[month] || month;
        const orderSuffix = orderNumber ? `-${orderNumber}` : "";

        return `№${day}/${month}/${shortYear}${orderSuffix} від «${day}» ${monthName} ${year} р.`;
    }

    return cleanValue;
}