"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import styles from "./TransportationRecordsPanel.module.css";

type GroupBy = "route" | "carrierCompany" | "customerCompany";

type TransportationRecord = {
    id: string;
    title: string | null;
    route: string | null;
    customerCompany: string | null;
    carrierCompany: string | null;
    vehicleDetails: string | null;
    cargoDetails: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
    _count: {
        documents: number;
    };
};

type RecordsResponse = {
    records: TransportationRecord[];
    message?: string;
};

async function fetchTransportationRecords(search: string) {
    const params = new URLSearchParams();

    if (search.trim()) {
        params.set("q", search.trim());
    }

    const response = await fetch(
        `/api/transportations?${params.toString()}`
    );

    const data = (await response.json()) as RecordsResponse;

    if (!response.ok) {
        throw new Error(
            data.message || "Помилка отримання перевезень"
        );
    }

    return data.records;
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

function getFolderTitle(record: TransportationRecord, groupBy: GroupBy) {
    if (groupBy === "carrierCompany") {
        return record.carrierCompany || "Без перевізника";
    }

    if (groupBy === "customerCompany") {
        return record.customerCompany || "Без замовника";
    }

    return record.route || "Без маршруту";
}

export default function TransportationRecordsPanel() {
    const [folderRoute, setFolderRoute] = useState("");
    const [folderCustomerCompany, setFolderCustomerCompany] = useState("");
    const [folderCarrierCompany, setFolderCarrierCompany] = useState("");
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [records, setRecords] = useState<TransportationRecord[]>([]);
    const [groupBy, setGroupBy] = useState<GroupBy>("route");
    const [search, setSearch] = useState("");
    const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadRecords(options?: { showLoading?: boolean }) {
        try {
            if (options?.showLoading) {
                setIsLoading(true);
            }

            setError("");

            const loadedRecords = await fetchTransportationRecords(search);

            setRecords(loadedRecords);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка отримання перевезень"
            );
        } finally {
            setIsLoading(false);
        }
    }

    async function deleteFolder(recordId: string) {
        const isConfirmed = window.confirm(
            "Видалити цю папку? Усі файли всередині також будуть видалені з R2."
        );

        if (!isConfirmed) {
            return;
        }

        try {
            setDeletingRecordId(recordId);
            setError("");

            const response = await fetch(`/api/transportations/${recordId}`, {
                method: "DELETE",
            });

            const data = (await response.json()) as { message?: string };

            if (!response.ok) {
                throw new Error(data.message || "Помилка видалення папки");
            }

            setRecords((currentRecords) =>
                currentRecords.filter((record) => record.id !== recordId)
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка видалення папки"
            );
        } finally {
            setDeletingRecordId(null);
        }
    }

    useEffect(() => {
        let isMounted = true;

        async function loadInitialRecords() {
            try {
                const loadedRecords = await fetchTransportationRecords("");

                if (!isMounted) {
                    return;
                }

                setRecords(loadedRecords);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setError(
                    error instanceof Error
                        ? error.message
                        : "Помилка отримання перевезень"
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadInitialRecords();

        return () => {
            isMounted = false;
        };
    }, []);

    const groupedRecords = useMemo(() => {
        const groups = new Map<string, TransportationRecord[]>();

        records.forEach((record) => {
            const title = getFolderTitle(record, groupBy);

            const existingGroup = groups.get(title) || [];
            existingGroup.push(record);

            groups.set(title, existingGroup);
        });

        return Array.from(groups.entries()).map(([title, items]) => ({
            title,
            items,
            updatedAt: items[0]?.updatedAt,
            documentsCount: items.reduce(
                (sum, item) => sum + item._count.documents,
                0
            ),
        }));
    }, [records, groupBy]);

    async function createFolder() {
        const route = folderRoute.trim();
        const customerCompany = folderCustomerCompany.trim();
        const carrierCompany = folderCarrierCompany.trim();

        if (!route && !customerCompany && !carrierCompany) {
            setError("Заповни хоча б маршрут, замовника або перевізника");
            return;
        }

        try {
            setIsCreatingFolder(true);
            setError("");

            const response = await fetch("/api/transportations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: route || customerCompany || carrierCompany,
                    route,
                    customerCompany,
                    carrierCompany,
                    formData: {
                        route,
                        customerCompany,
                        carrierCompany,
                    },
                }),
            });

            const data = (await response.json()) as { message?: string };

            if (!response.ok) {
                throw new Error(data.message || "Помилка створення папки");
            }

            setFolderRoute("");
            setFolderCustomerCompany("");
            setFolderCarrierCompany("");

            await loadRecords({ showLoading: true });
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка створення папки"
            );
        } finally {
            setIsCreatingFolder(false);
        }
    }

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Папки перевезень</h2>

                    <p className={styles.subtitle}>
                        За замовчуванням папки згруповані за маршрутом і
                        відсортовані за останнім редагуванням.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.refreshButton}
                    onClick={() => loadRecords({ showLoading: true })}
                    disabled={isLoading}
                >
                    {isLoading ? "Оновлення..." : "Оновити"}
                </button>
            </div>

            <div className={styles.createBox}>
                <h3 className={styles.createTitle}>Створити папку</h3>

                <div className={styles.createGrid}>
                    <label className={styles.group}>
                        <span className={styles.label}>Маршрут</span>

                        <input
                            className={styles.input}
                            type="text"
                            value={folderRoute}
                            onChange={(event) => setFolderRoute(event.target.value)}
                            placeholder="Наприклад, Львів — Рівне"
                        />
                    </label>

                    <label className={styles.group}>
                        <span className={styles.label}>Замовник</span>

                        <input
                            className={styles.input}
                            type="text"
                            value={folderCustomerCompany}
                            onChange={(event) =>
                                setFolderCustomerCompany(event.target.value)
                            }
                            placeholder="Назва замовника"
                        />
                    </label>

                    <label className={styles.group}>
                        <span className={styles.label}>Перевізник</span>

                        <input
                            className={styles.input}
                            type="text"
                            value={folderCarrierCompany}
                            onChange={(event) =>
                                setFolderCarrierCompany(event.target.value)
                            }
                            placeholder="Назва перевізника"
                        />
                    </label>

                    <button
                        type="button"
                        className={styles.createButton}
                        onClick={createFolder}
                        disabled={isCreatingFolder}
                    >
                        {isCreatingFolder ? "Створення..." : "Створити папку"}
                    </button>
                </div>
            </div>

            <div className={styles.controls}>
                <label className={styles.group}>
                    <span className={styles.label}>Групувати за</span>

                    <select
                        className={styles.select}
                        value={groupBy}
                        onChange={(event) =>
                            setGroupBy(event.target.value as GroupBy)
                        }
                    >
                        <option value="route">Маршрутом</option>
                        <option value="carrierCompany">Перевізником</option>
                        <option value="customerCompany">Замовником</option>
                    </select>
                </label>

                <label className={styles.group}>
                    <span className={styles.label}>Пошук</span>

                    <input
                        className={styles.input}
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Маршрут, замовник або перевізник"
                    />
                </label>

                <button
                    type="button"
                    className={styles.searchButton}
                    onClick={() => loadRecords({ showLoading: true })}
                    disabled={isLoading}
                >
                    Знайти
                </button>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            {isLoading ? (
                <p className={styles.empty}>Завантаження...</p>
            ) : groupedRecords.length === 0 ? (
                <p className={styles.empty}>Папок ще немає</p>
            ) : (
                <div className={styles.grid}>
                    {groupedRecords.map((group) => (
                        <article
                            key={group.title}
                            className={styles.folderCard}
                        >
                            <div className={styles.folderIcon}>📁</div>

                            <div className={styles.folderContent}>
                                <h3 className={styles.folderTitle}>
                                    {group.title}
                                </h3>

                                <p className={styles.folderMeta}>
                                    Перевезень: {group.items.length}
                                </p>

                                <p className={styles.folderMeta}>
                                    Файлів: {group.documentsCount}
                                </p>

                                {group.updatedAt && (
                                    <p className={styles.folderDate}>
                                        Оновлено:{" "}
                                        {formatDate(group.updatedAt)}
                                    </p>
                                )}

                                <div className={styles.recordsList}>
                                    {group.items.map((record) => (
                                        <div key={record.id} className={styles.recordActions}>
                                            <Link
                                                href={`/documents/search/${record.id}`}
                                                className={styles.openLink}
                                            >
                                                Відкрити
                                                {record.route ? `: ${record.route}` : ""}
                                            </Link>

                                            <button
                                                type="button"
                                                className={styles.deleteFolderButton}
                                                onClick={() => deleteFolder(record.id)}
                                                disabled={deletingRecordId === record.id}
                                            >
                                                {deletingRecordId === record.id
                                                    ? "Видалення..."
                                                    : "Видалити"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}