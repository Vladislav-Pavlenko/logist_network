"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import styles from "./TransportationForm.module.css";

import { DocumentData, DocumentType } from "./types";
import { initialDraft } from "./initialDraft";

import { CarrierOrderForm } from "./forms/CarrierOrderForm";
import { CustomerOrderForm } from "./forms/CustomerOrderForm";
import { ActForm } from "./forms/ActForm";
import { InvoiceForm } from "./forms/InvoiceForm";
import { ForwarderReportForm } from "./forms/ForwarderReportForm";
import { ForwardingAgreementForm } from "./forms/ForwardingAgreementForm";
import { CarrierForwardingAgreementForm } from "./forms/CarrierForwardingAgreementForm";
import { TransportCostsCertificateForm } from "./forms/TransportCostsCertificateForm";

type TransportationRecordResponse = {
    record?: {
        id: string;
        formData: Record<string, unknown> | null;
    };
    message?: string;
};

export default function TransportationForm() {
    const searchParams = useSearchParams();
    const transportationRecordId = searchParams.get("recordId");

    const [activeDocument, setActiveDocument] = useState<DocumentType | null>(
        null
    );

    const [initialValues, setInitialValues] =
        useState<DocumentData>(initialDraft);

    const [loadedRecordId, setLoadedRecordId] = useState<string | null>(null);
    const [isLoadingRecord, setIsLoadingRecord] = useState(
        Boolean(transportationRecordId)
    );
    const [recordLoadError, setRecordLoadError] = useState("");

    const currentRecordId =
        loadedRecordId || transportationRecordId || undefined;

    useEffect(() => {
        if (!transportationRecordId) {
            return;
        }

        const controller = new AbortController();

        async function loadRecordData() {
            try {
                setRecordLoadError("");

                const response = await fetch(
                    `/api/transportations/${transportationRecordId}`,
                    {
                        signal: controller.signal,
                    }
                );

                const data =
                    (await response.json()) as TransportationRecordResponse;

                if (!response.ok || !data.record) {
                    throw new Error(
                        data.message || "Помилка завантаження даних"
                    );
                }

                const formData = data.record.formData;

                if (
                    formData &&
                    typeof formData === "object" &&
                    !Array.isArray(formData)
                ) {
                    setInitialValues({
                        ...initialDraft,
                        ...(formData as Partial<DocumentData>),
                    });
                }

                setLoadedRecordId(data.record.id);
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                setRecordLoadError(
                    error instanceof Error
                        ? error.message
                        : "Помилка завантаження даних"
                );
            } finally {
                setIsLoadingRecord(false);
            }
        }

        void loadRecordData();

        return () => {
            controller.abort();
        };
    }, [transportationRecordId]);

    const formProps = {
        initialValues,
        transportationRecordId: currentRecordId,
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Документація</h1>

                    <p className={styles.subtitle}>
                        Вибери документ, заповни потрібні дані та сформуй
                        Word-файл.
                    </p>

                    {isLoadingRecord && (
                        <p className={styles.subtitle}>
                            Завантаження даних з папки...
                        </p>
                    )}

                    {currentRecordId && !isLoadingRecord && (
                        <p className={styles.subtitle}>
                            Дані відкрито з папки перевезення. Нові документи
                            будуть збережені в цю ж папку.
                        </p>
                    )}

                    {recordLoadError && (
                        <p className={styles.error}>{recordLoadError}</p>
                    )}
                </div>

                <div className={styles.documentMenu}>
                    <button
                        type="button"
                        className={styles.documentButton}
                        onClick={() =>
                            setActiveDocument("transportOrderAgreement")
                        }
                    >
                        Заявка з перевізником
                    </button>

                    <button
                        type="button"
                        className={styles.documentButton}
                        onClick={() =>
                            setActiveDocument("customerOrderAgreement")
                        }
                    >
                        Заявка із замовником
                    </button>

                    <button
                        type="button"
                        className={styles.documentButton}
                        onClick={() => setActiveDocument("act")}
                    >
                        Акт
                    </button>

                    <button
                        type="button"
                        className={styles.documentButton}
                        onClick={() => setActiveDocument("invoice")}
                    >
                        Рахунок
                    </button>

                    <button
                        type="button"
                        className={styles.documentButton}
                        onClick={() => setActiveDocument("forwarderReport")}
                    >
                        Звіт експедитора
                    </button>

                    <button
                        type="button"
                        className={styles.documentButton}
                        onClick={() =>
                            setActiveDocument("customerForwardingAgreement")
                        }
                    >
                        Договір експедиції з замовником
                    </button>

                    <button
                        type="button"
                        className={styles.documentButton}
                        onClick={() =>
                            setActiveDocument("carrierForwardingAgreement")
                        }
                    >
                        Договір експедиції з перевізником
                    </button>

                    <button
                        type="button"
                        className={styles.documentButton}
                        onClick={() =>
                            setActiveDocument("transportCostsCertificate")
                        }
                    >
                        Довідка про транспортні витрати
                    </button>
                </div>

                {activeDocument === "transportOrderAgreement" && (
                    <CarrierOrderForm {...formProps} />
                )}

                {activeDocument === "customerOrderAgreement" && (
                    <CustomerOrderForm {...formProps} />
                )}

                {activeDocument === "act" && <ActForm {...formProps} />}

                {activeDocument === "invoice" && (
                    <InvoiceForm {...formProps} />
                )}

                {activeDocument === "forwarderReport" && (
                    <ForwarderReportForm {...formProps} />
                )}

                {activeDocument === "customerForwardingAgreement" && (
                    <ForwardingAgreementForm {...formProps} />
                )}

                {activeDocument === "carrierForwardingAgreement" && (
                    <CarrierForwardingAgreementForm {...formProps} />
                )}

                {activeDocument === "transportCostsCertificate" && (
                    <TransportCostsCertificateForm {...formProps} />
                )}
            </div>
        </section>
    );
}