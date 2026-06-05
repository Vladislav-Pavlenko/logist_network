"use client";

import { useEffect, useState } from "react";
import { DocumentData } from "../types";
import { initialDraft } from "../initialDraft";

const STORAGE_KEY = "transportationDraft";

export function useTransportationDraft() {
    const [draft, setDraft] = useState<DocumentData>(initialDraft);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedDraft = localStorage.getItem(STORAGE_KEY);

        if (!savedDraft) {
            setIsLoaded(true);
            return;
        }

        try {
            setDraft({
                ...initialDraft,
                ...JSON.parse(savedDraft),
            });
        } catch {
            setDraft(initialDraft);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    function saveDraft(data: DocumentData) {
        const nextDraft = {
            ...draft,
            ...data,
        };

        setDraft(nextDraft);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
    }

    function clearDraft() {
        setDraft(initialDraft);
        localStorage.removeItem(STORAGE_KEY);
    }

    return {
        draft,
        isLoaded,
        saveDraft,
        clearDraft,
    };
}