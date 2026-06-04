export function formatBankDetails(value: string): {
    bankDetailsTitle: string;
    bankDetailsText: string;
} {
    const lines = value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const [firstLine, ...restLines] = lines;

    return {
        bankDetailsTitle: firstLine || "",
        bankDetailsText: restLines.join("\n"),
    };
}