export type CapitalizeMode = "first" | "words" | "sentences";

export function capitalizeText(
    value: string,
    mode: CapitalizeMode = "first"
): string {
    if (!value.trim()) return "";

    const lowerValue = value.trim().toLowerCase();

    switch (mode) {
        case "first":
            return capitalizeFirstLetter(lowerValue);

        case "words":
            return lowerValue
                .split(" ")
                .map((word) => capitalizeFirstLetter(word))
                .join(" ");

        case "sentences":
            return lowerValue.replace(/(^\s*\p{L}|[.!?]\s*\p{L})/gu, (match) =>
                match.toUpperCase()
            );

        default:
            return lowerValue;
    }
}

function capitalizeFirstLetter(value: string): string {
    if (!value) return "";

    return value.charAt(0).toUpperCase() + value.slice(1);
}