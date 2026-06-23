"use client";

import { useEffect } from "react";
import { sendGAEvent } from '@next/third-parties/google';

export function ErrorTracker() {
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            sendGAEvent('event', 'global_js_error', {
                message: event.message,
                source: event.filename,
                line: event.lineno,
            });
        };

        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", (event) => {
            sendGAEvent('event', 'global_promise_error', {
                reason: String(event.reason),
            });
        });

        return () => {
            window.removeEventListener("error", handleError);
        };
    }, []);

    return null;
}