"use client";

import { FormEvent, useEffect, useState } from "react";

import styles from "./RegistrationCodesPanel.module.css";
import {AdminChangePassword} from "@/app/components/Admin/AdminChangePassword";

type RegistrationCodeItem = {
    id: string;
    codePreview: string;
    isUsed: boolean;
    createdAt: string;
    expiresAt: string | null;
    usedAt: string | null;
    usedBy: {
        id: string;
        name: string;
        email: string;
    } | null;
    createdBy: {
        id: string;
        name: string;
        email: string;
    } | null;
};

type CodesResponse = {
    codes: RegistrationCodeItem[];
    message?: string;
};

type CreateCodeResponse = {
    message: string;
    code: string;
    registrationCode: {
        id: string;
        codePreview: string;
        expiresAt: string | null;
        createdAt: string;
    };
};

async function fetchCodes() {
    const response = await fetch("/api/admin/registration-codes");

    const data = (await response.json()) as CodesResponse;

    if (!response.ok) {
        throw new Error(data.message || "Помилка отримання кодів");
    }

    return data.codes;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export default function RegistrationCodesPanel() {
    const [codes, setCodes] = useState<RegistrationCodeItem[]>([]);
    const [generatedCode, setGeneratedCode] = useState("");

    const [expiresInDays, setExpiresInDays] = useState("30");

    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadInitialCodes() {
            try {
                const loadedCodes = await fetchCodes();

                if (!isMounted) {
                    return;
                }

                setCodes(loadedCodes);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setError(
                    error instanceof Error
                        ? error.message
                        : "Помилка отримання кодів"
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadInitialCodes();

        return () => {
            isMounted = false;
        };
    }, []);

    async function loadCodes() {
        try {
            setIsLoading(true);
            setError("");

            const loadedCodes = await fetchCodes();

            setCodes(loadedCodes);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка отримання кодів"
            );
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateCode(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setIsCreating(true);
            setError("");
            setMessage("");
            setGeneratedCode("");

            const parsedExpiresInDays = Number(expiresInDays);

            const response = await fetch("/api/admin/registration-codes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    expiresInDays:
                        parsedExpiresInDays > 0
                            ? parsedExpiresInDays
                            : null,
                }),
            });

            const data = (await response.json()) as CreateCodeResponse;

            if (!response.ok) {
                throw new Error(data.message || "Помилка створення коду");
            }

            setGeneratedCode(data.code);
            setMessage("Код створено. Скопіюй його зараз.");

            await loadCodes();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка створення коду"
            );
        } finally {
            setIsCreating(false);
        }
    }

    async function copyCode() {
        if (!generatedCode) {
            return;
        }

        await navigator.clipboard.writeText(generatedCode);

        setMessage("Код скопійовано");
    }

    return (
        <main className={styles.page}>
            <section className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>
                            Коди реєстрації
                        </h1>

                        <p className={styles.subtitle}>
                            Створюй одноразові коди для реєстрації нових
                            користувачів.
                        </p>
                    </div>
                </div>

                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>
                        Створити новий код
                    </h2>

                    <form
                        className={styles.form}
                        onSubmit={handleCreateCode}
                    >
                        <label className={styles.group}>
                            <span className={styles.label}>
                                Термін дії, днів
                            </span>

                            <input
                                className={styles.input}
                                type="number"
                                min="1"
                                value={expiresInDays}
                                onChange={(event) =>
                                    setExpiresInDays(event.target.value)
                                }
                                placeholder="30"
                            />
                        </label>

                        <button
                            className={styles.button}
                            type="submit"
                            disabled={isCreating}
                        >
                            {isCreating
                                ? "Створення..."
                                : "Створити код"}
                        </button>
                    </form>

                    {generatedCode && (
                        <div className={styles.generatedBox}>
                            <span className={styles.generatedLabel}>
                                Новий код:
                            </span>

                            <strong className={styles.generatedCode}>
                                {generatedCode}
                            </strong>

                            <button
                                type="button"
                                className={styles.copyButton}
                                onClick={copyCode}
                            >
                                Скопіювати
                            </button>
                        </div>
                    )}

                    {message && (
                        <p className={styles.message}>
                            {message}
                        </p>
                    )}

                    {error && (
                        <p className={styles.error}>
                            {error}
                        </p>
                    )}
                </section>

                <section className={styles.card}>
                    <div className={styles.tableHeader}>
                        <h2 className={styles.cardTitle}>
                            Список кодів
                        </h2>

                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={loadCodes}
                            disabled={isLoading}
                        >
                            {isLoading ? "Оновлення..." : "Оновити"}
                        </button>
                    </div>

                    {isLoading ? (
                        <p className={styles.empty}>
                            Завантаження...
                        </p>
                    ) : codes.length === 0 ? (
                        <p className={styles.empty}>
                            Кодів ще немає
                        </p>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>Код</th>
                                    <th>Статус</th>
                                    <th>Створено</th>
                                    <th>Діє до</th>
                                    <th>Використав</th>
                                </tr>
                                </thead>

                                <tbody>
                                {codes.map((code) => (
                                    <tr key={code.id}>
                                        <td>{code.codePreview}</td>

                                        <td>
                                                <span
                                                    className={
                                                        code.isUsed
                                                            ? styles.usedBadge
                                                            : styles.activeBadge
                                                    }
                                                >
                                                    {code.isUsed
                                                        ? "Використано"
                                                        : "Активний"}
                                                </span>
                                        </td>

                                        <td>
                                            {formatDate(code.createdAt)}
                                        </td>

                                        <td>
                                            {code.expiresAt
                                                ? formatDate(
                                                    code.expiresAt
                                                )
                                                : "Безстроково"}
                                        </td>

                                        <td>
                                            {code.usedBy
                                                ? `${code.usedBy.name} (${code.usedBy.email})`
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <AdminChangePassword/>
            </section>


        </main>
    );
}