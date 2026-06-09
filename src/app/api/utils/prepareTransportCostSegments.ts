import {
    TransportCostSegment,
} from "./documentTypes";

import {
    formatMoney,
    moneyToWords,
    numberToWords,
} from "./money";

export type PreparedTransportCostSegment = {
    from: string;
    to: string;

    distanceKm: string;
    distanceKmWords: string;

    amount: string;
    amountWords: string;
};

export function prepareTransportCostSegments(
    segments: TransportCostSegment[]
): PreparedTransportCostSegment[] {
    return segments.map((segment) => ({
        from: segment.from?.trim() || "",
        to: segment.to?.trim() || "",

        distanceKm:
            segment.distanceKm?.trim() || "0",

        distanceKmWords: numberToWords(
            segment.distanceKm || "0"
        ),

        amount: formatMoney(
            segment.amount || "0"
        ),

        amountWords: moneyToWords(
            segment.amount || "0"
        ),
    }));
}