"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import styles from "./TransportationRecordDocuments.module.css";

type TransportationDocument = {
    id: string;
    fileName: string;
    originalFileName: string | null;
    mimeType: string;
    size: number;
    extension: string | null;
    documentType: string;
    source: "GENERATED" | "UPLOADED" | "SCANNED";
    createdAt: string;
    updatedAt: string;
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
};

type TransportationRecordDetails = {
    id: string;
    title: string | null;
    route: string | null;
    customerCompany: string | null;
    carrierCompany: string | null;
    vehicleDetails: string | null;
    cargoDetails: string | null;
    createdAt: string;
    updatedAt: string;
};

type DocumentsResponse = {
    documents: TransportationDocument[];
    message?: string;
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatFileSize(size: number) {
    if (size < 1024) {
        return `${size} Б`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} КБ`;
    }

    return `${(size / 1024 / 1024).toFixed(1)} МБ`;
}

function getSourceLabel(source: TransportationDocument["source"]) {
    if (source === "GENERATED") {
        return "Згенерований";
    }

    if (source === "UPLOADED") {
        return "Завантажений";
    }

    return "Скан";
}

function canPreviewFile(document: TransportationDocument) {
    return (
        document.mimeType === "application/pdf" ||
        document.mimeType.startsWith("image/")
    );
}

function isDocxFile(document: TransportationDocument) {
    return (
        document.extension === "docx" ||
        document.mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
}

export default function TransportationRecordDocuments() {
    const params = useParams<{ id: string }>();
    const recordId = params.id;

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [record, setRecord] = useState<TransportationRecordDetails | null>(
        null
    );
    const [documents, setDocuments] = useState<TransportationDocument[]>([]);

    const [editRoute, setEditRoute] = useState("");
    const [editCustomerCompany, setEditCustomerCompany] = useState("");
    const [editCarrierCompany, setEditCarrierCompany] = useState("");

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);

    const [documentSearch, setDocumentSearch] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isSavingRecord, setIsSavingRecord] = useState(false);
    const [isDownloadingZip, setIsDownloadingZip] = useState(false);

    const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
        null
    );

    const [error, setError] = useState("");
    const normalizedDocumentSearch = documentSearch.trim().toLowerCase();

    const filteredDocuments = documents.filter((document) => {
        if (!normalizedDocumentSearch) {
            return true;
        }

        return document.fileName.toLowerCase().includes(normalizedDocumentSearch);
    });

    const filteredDocumentIds = filteredDocuments.map((document) => document.id);

    const areAllFilteredDocumentsSelected =
        filteredDocumentIds.length > 0 &&
        filteredDocumentIds.every((id) => selectedDocumentIds.includes(id));

    useEffect(() => {
        if (!recordId) {
            return;
        }

        const controller = new AbortController();

        async function loadInitialData() {
            try {
                const [recordResponse, documentsResponse] = await Promise.all([
                    fetch(`/api/transportations/${recordId}`, {
                        signal: controller.signal,
                    }),
                    fetch(`/api/transportations/${recordId}/documents`, {
                        signal: controller.signal,
                    }),
                ]);

                const recordData = (await recordResponse.json()) as {
                    record?: TransportationRecordDetails;
                    message?: string;
                };

                const documentsData =
                    (await documentsResponse.json()) as DocumentsResponse;

                if (!recordResponse.ok || !recordData.record) {
                    throw new Error(
                        recordData.message || "Помилка отримання папки"
                    );
                }

                if (!documentsResponse.ok) {
                    throw new Error(
                        documentsData.message ||
                        "Помилка отримання документів"
                    );
                }

                setRecord(recordData.record);
                setEditRoute(recordData.record.route || "");
                setEditCustomerCompany(recordData.record.customerCompany || "");
                setEditCarrierCompany(recordData.record.carrierCompany || "");
                setDocuments(documentsData.documents);
                setError("");
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                setError(
                    error instanceof Error
                        ? error.message
                        : "Помилка завантаження даних"
                );
            } finally {
                setIsLoading(false);
            }
        }

        void loadInitialData();

        return () => {
            controller.abort();
        };
    }, [recordId]);

    async function loadDocuments(options?: { showLoading?: boolean }) {
        if (!recordId) {
            return;
        }

        try {
            if (options?.showLoading) {
                setIsLoading(true);
            }

            setError("");

            const response = await fetch(
                `/api/transportations/${recordId}/documents`
            );

            const data = (await response.json()) as DocumentsResponse;

            if (!response.ok) {
                throw new Error(
                    data.message || "Помилка отримання документів"
                );
            }

            setDocuments(data.documents);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка отримання документів"
            );
        } finally {
            setIsLoading(false);
        }
    }

    async function saveRecordDetails() {
        if (!recordId) {
            return;
        }

        try {
            setIsSavingRecord(true);
            setError("");

            const response = await fetch(`/api/transportations/${recordId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    route: editRoute,
                    customerCompany: editCustomerCompany,
                    carrierCompany: editCarrierCompany,
                }),
            });

            const data = (await response.json()) as {
                record?: TransportationRecordDetails;
                message?: string;
            };

            if (!response.ok || !data.record) {
                throw new Error(data.message || "Помилка збереження папки");
            }

            setRecord(data.record);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка збереження папки"
            );
        } finally {
            setIsSavingRecord(false);
        }
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
    }

    async function handleUploadFile() {
        if (!selectedFile || !recordId) {
            return;
        }

        try {
            setIsUploading(true);
            setError("");

            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await fetch(
                `/api/transportations/${recordId}/documents`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = (await response.json()) as { message?: string };

            if (!response.ok) {
                throw new Error(data.message || "Помилка завантаження файлу");
            }

            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await loadDocuments({ showLoading: true });
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка завантаження файлу"
            );
        } finally {
            setIsUploading(false);
        }
    }

    async function deleteDocument(documentId: string) {
        const isConfirmed = window.confirm(
            "Видалити цей файл? Його буде видалено з папки та зі сховища R2."
        );

        if (!isConfirmed) {
            return;
        }

        try {
            setDeletingDocumentId(documentId);
            setError("");

            const response = await fetch(`/api/documents/${documentId}`, {
                method: "DELETE",
            });

            const data = (await response.json()) as { message?: string };

            if (!response.ok) {
                throw new Error(data.message || "Помилка видалення документа");
            }

            setDocuments((currentDocuments) =>
                currentDocuments.filter((document) => document.id !== documentId)
            );

            setSelectedDocumentIds((currentIds) =>
                currentIds.filter((id) => id !== documentId)
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка видалення документа"
            );
        } finally {
            setDeletingDocumentId(null);
        }
    }

    function toggleDocumentSelection(documentId: string) {
        setSelectedDocumentIds((currentIds) =>
            currentIds.includes(documentId)
                ? currentIds.filter((id) => id !== documentId)
                : [...currentIds, documentId]
        );
    }

    function toggleSelectAll() {
        if (areAllFilteredDocumentsSelected) {
            setSelectedDocumentIds((currentIds) =>
                currentIds.filter((id) => !filteredDocumentIds.includes(id))
            );

            return;
        }

        setSelectedDocumentIds((currentIds) => [
            ...currentIds,
            ...filteredDocumentIds.filter((id) => !currentIds.includes(id)),
        ]);
    }

    async function downloadSelectedAsZip() {
        if (selectedDocumentIds.length === 0) {
            return;
        }

        try {
            setIsDownloadingZip(true);
            setError("");

            const response = await fetch("/api/documents/download-zip", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    documentIds: selectedDocumentIds,
                }),
            });

            if (!response.ok) {
                const data = (await response.json()) as { message?: string };
                throw new Error(data.message || "Помилка скачування ZIP");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "documents.zip";

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка скачування ZIP"
            );
        } finally {
            setIsDownloadingZip(false);
        }
    }

    return (
        <main className={styles.page}>
            <div className={styles.header}>
                <div>
                    <Link href="/documents/search" className={styles.backLink}>
                        ← Назад до пошуку
                    </Link>

                    <h1 className={styles.title}>Файли перевезення</h1>

                    <p className={styles.subtitle}>
                        Тут відображаються згенеровані та завантажені документи.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <Link
                        href={`/documents?recordId=${recordId}`}
                        className={styles.generateButton}
                    >
                        Відкрити в генерації
                    </Link>

                    <button
                        type="button"
                        className={styles.refreshButton}
                        onClick={() => loadDocuments({ showLoading: true })}
                        disabled={isLoading}
                    >
                        {isLoading ? "Оновлення..." : "Оновити"}
                    </button>
                </div>
            </div>

            <div className={styles.recordBox}>
                <div className={styles.recordHeader}>
                    <div>
                        <h2 className={styles.recordTitle}>
                            {record?.route || "Папка перевезення"}
                        </h2>

                        <p className={styles.recordSubtitle}>
                            Дані папки можна змінити, після цього вона оновиться
                            в пошуку.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={styles.saveRecordButton}
                        onClick={saveRecordDetails}
                        disabled={isSavingRecord}
                    >
                        {isSavingRecord ? "Збереження..." : "Зберегти"}
                    </button>
                </div>

                <div className={styles.recordGrid}>
                    <label className={styles.recordGroup}>
                        <span>Маршрут</span>

                        <input
                            className={styles.recordInput}
                            type="text"
                            value={editRoute}
                            onChange={(event) => setEditRoute(event.target.value)}
                            placeholder="Львів — Рівне"
                        />
                    </label>

                    <label className={styles.recordGroup}>
                        <span>Замовник</span>

                        <input
                            className={styles.recordInput}
                            type="text"
                            value={editCustomerCompany}
                            onChange={(event) =>
                                setEditCustomerCompany(event.target.value)
                            }
                            placeholder="Назва замовника"
                        />
                    </label>

                    <label className={styles.recordGroup}>
                        <span>Перевізник</span>

                        <input
                            className={styles.recordInput}
                            type="text"
                            value={editCarrierCompany}
                            onChange={(event) =>
                                setEditCarrierCompany(event.target.value)
                            }
                            placeholder="Назва перевізника"
                        />
                    </label>
                </div>
            </div>

            <div className={styles.uploadBox}>
                <div className={styles.uploadInfo}>
                    <span className={styles.uploadTitle}>
                        Додати файл у папку
                    </span>

                    <span className={styles.uploadHint}>
                        DOCX, PDF, JPG, PNG до 10 МБ
                    </span>

                    {selectedFile && (
                        <span className={styles.selectedFile}>
                            Обрано: {selectedFile.name}
                        </span>
                    )}
                </div>

                <label className={styles.customFileButton}>
                    Обрати файл

                    <input
                        ref={fileInputRef}
                        className={styles.fileInput}
                        type="file"
                        accept=".docx,.pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                    />
                </label>

                <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={handleUploadFile}
                    disabled={!selectedFile || isUploading}
                >
                    {isUploading ? "Завантаження..." : "Завантажити"}
                </button>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.documentSearchBox}>
                <input
                    type="search"
                    value={documentSearch}
                    onChange={(event) => setDocumentSearch(event.target.value)}
                    className={styles.documentSearchInput}
                    placeholder="Пошук файлу в папці..."
                />

                {documentSearch && (
                    <span className={styles.documentSearchResult}>
            Знайдено: {filteredDocuments.length}
        </span>
                )}
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={toggleSelectAll}
                    disabled={documents.length === 0}
                >
                    {selectedDocumentIds.length === documents.length
                        ? "Зняти вибір"
                        : "Вибрати всі"}
                </button>

                <button
                    type="button"
                    className={styles.zipButton}
                    onClick={downloadSelectedAsZip}
                    disabled={selectedDocumentIds.length === 0 || isDownloadingZip}
                >
                    {isDownloadingZip
                        ? "Створення ZIP..."
                        : `Скачати ZIP (${selectedDocumentIds.length})`}
                </button>
            </div>

            {isLoading ? (
                <p className={styles.empty}>Завантаження...</p>
            ) : documents.length === 0 ? (
                <p className={styles.empty}>У цій папці ще немає файлів</p>
            ) : filteredDocuments.length === 0 ? (
                <p className={styles.empty}>Файлів за таким пошуком не знайдено</p>
            ) : (
                <div className={styles.list}>
                    {filteredDocuments.map((document) => (
                        <article key={document.id} className={styles.card}>
                            <input
                                className={styles.checkbox}
                                type="checkbox"
                                checked={selectedDocumentIds.includes(document.id)}
                                onChange={() =>
                                    toggleDocumentSelection(document.id)
                                }
                            />

                            <div className={styles.fileIcon}>
                                {document.extension === "pdf" ? "📄" : "📝"}
                            </div>

                            <div className={styles.content}>
                                <h2 className={styles.fileName}>
                                    {document.fileName}
                                </h2>

                                <div className={styles.meta}>
                                    <span>{getSourceLabel(document.source)}</span>
                                    <span>{formatFileSize(document.size)}</span>
                                    <span>{formatDate(document.createdAt)}</span>
                                </div>

                                <p className={styles.owner}>
                                    Додав: {document.createdBy.name}
                                </p>
                            </div>

                            <div className={styles.cardActions}>
                                {canPreviewFile(document) && (
                                    <a
                                        className={styles.previewButton}
                                        href={`/api/documents/${document.id}/preview`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Переглянути
                                    </a>
                                )}

                                {isDocxFile(document) && (
                                    <a
                                        className={styles.previewButton}
                                        href={`/api/documents/${document.id}/preview-docx`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Переглянути
                                    </a>
                                )}

                                <a
                                    className={styles.downloadButton}
                                    href={`/api/documents/${document.id}/download`}
                                >
                                    Скачати
                                </a>

                                <button
                                    type="button"
                                    className={styles.deleteButton}
                                    onClick={() => deleteDocument(document.id)}
                                    disabled={deletingDocumentId === document.id}
                                >
                                    {deletingDocumentId === document.id
                                        ? "Видалення..."
                                        : "Видалити"}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}