import { capitalizeText } from "./capitalizeText";

export function parseMoney(value: string): number {
    const normalizedValue = String(value).replace(/\s/g, "").replace(",", ".");
    const numberValue = Number(normalizedValue);

    return Number.isNaN(numberValue) ? 0 : numberValue;
}

export function formatMoney(value: string): string {
    const numberValue = parseMoney(value);

    return numberValue.toLocaleString("uk-UA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function numberToWords(value: string): string {
    const numberValue = Number(
        String(value)
            .replace(/\s/g, "")
            .replace(",", ".")
    );

    if (Number.isNaN(numberValue)) {
        return value;
    }

    return numberToUkrainianWords(
        Math.floor(numberValue)
    );
}

export function moneyToWords(value: string): string {
    const numberValue = parseMoney(value);

    if (Number.isNaN(numberValue)) {
        return value;
    }

    const hryvnias = Math.floor(numberValue);
    const kopiyky = Math.round((numberValue - hryvnias) * 100);

    const hryvniaWords = numberToUkrainianWords(hryvnias);
    const hryvniaLabel = getHryvniaLabel(hryvnias);
    const kopiykyText = String(kopiyky).padStart(2, "0");

    return `${capitalizeText(
        hryvniaWords,
        "first"
    )} ${hryvniaLabel} ${kopiykyText} копійок`;
}

export function numberToUkrainianWords(num: number): string {
    if (num === 0) return "нуль";

    const onesFeminine = [
        "",
        "одна",
        "дві",
        "три",
        "чотири",
        "пʼять",
        "шість",
        "сім",
        "вісім",
        "девʼять",
    ];

    const onesMasculine = [
        "",
        "один",
        "два",
        "три",
        "чотири",
        "пʼять",
        "шість",
        "сім",
        "вісім",
        "девʼять",
    ];

    const teens = [
        "десять",
        "одинадцять",
        "дванадцять",
        "тринадцять",
        "чотирнадцять",
        "пʼятнадцять",
        "шістнадцять",
        "сімнадцять",
        "вісімнадцять",
        "девʼятнадцять",
    ];

    const tens = [
        "",
        "",
        "двадцять",
        "тридцять",
        "сорок",
        "пʼятдесят",
        "шістдесят",
        "сімдесят",
        "вісімдесят",
        "девʼяносто",
    ];

    const hundreds = [
        "",
        "сто",
        "двісті",
        "триста",
        "чотириста",
        "пʼятсот",
        "шістсот",
        "сімсот",
        "вісімсот",
        "девʼятсот",
    ];

    function convertBelowThousand(value: number, feminine: boolean): string {
        const result: string[] = [];

        const h = Math.floor(value / 100);
        const t = Math.floor((value % 100) / 10);
        const o = value % 10;

        if (h) result.push(hundreds[h]);

        if (t === 1) {
            result.push(teens[o]);
        } else {
            if (t) result.push(tens[t]);
            if (o) result.push(feminine ? onesFeminine[o] : onesMasculine[o]);
        }

        return result.join(" ");
    }

    const parts: string[] = [];

    const millions = Math.floor(num / 1_000_000);
    const thousands = Math.floor((num % 1_000_000) / 1000);
    const rest = num % 1000;

    if (millions > 0) {
        parts.push(convertBelowThousand(millions, false));
        parts.push(getMillionLabel(millions));
    }

    if (thousands > 0) {
        parts.push(convertBelowThousand(thousands, true));
        parts.push(getThousandLabel(thousands));
    }

    if (rest > 0) {
        parts.push(convertBelowThousand(rest, true));
    }

    return parts.join(" ");
}

function getMillionLabel(value: number): string {
    const lastTwo = value % 100;
    const lastOne = value % 10;

    if (lastTwo >= 11 && lastTwo <= 14) return "мільйонів";
    if (lastOne === 1) return "мільйон";
    if (lastOne >= 2 && lastOne <= 4) return "мільйони";

    return "мільйонів";
}

function getThousandLabel(value: number): string {
    const lastTwo = value % 100;
    const lastOne = value % 10;

    if (lastTwo >= 11 && lastTwo <= 14) return "тисяч";
    if (lastOne === 1) return "тисяча";
    if (lastOne >= 2 && lastOne <= 4) return "тисячі";

    return "тисяч";
}

function getHryvniaLabel(value: number): string {
    const lastTwo = value % 100;
    const lastOne = value % 10;

    if (lastTwo >= 11 && lastTwo <= 14) return "гривень";
    if (lastOne === 1) return "гривня";
    if (lastOne >= 2 && lastOne <= 4) return "гривні";

    return "гривень";
}