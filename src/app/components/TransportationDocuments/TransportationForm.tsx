"use client";

import { useState } from "react";
import styles from "./TransportationForm.module.css";
import { DocumentType } from "./types";
import { CarrierOrderForm } from "./forms/CarrierOrderForm";
import { CustomerOrderForm } from "./forms/CustomerOrderForm";
import { ActForm } from "./forms/ActForm";
import { InvoiceForm } from "./forms/InvoiceForm";
import { ForwarderReportForm } from "./forms/ForwarderReportForm";
import { ForwardingAgreementForm } from "./forms/ForwardingAgreementForm";
import { CarrierForwardingAgreementForm } from "./forms/CarrierForwardingAgreementForm";
import { TransportCostsCertificateForm } from "./forms/TransportCostsCertificateForm";

export default function TransportationForm() {
    const [activeDocument, setActiveDocument] = useState<DocumentType | null>(
        null
    );

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Документація</h1>
                    <p className={styles.subtitle}>
                        Вибери документ, заповни потрібні дані та сформуй Word-файл.
                    </p>
                </div>

                <div className={styles.documentMenu}>
                    <button
                        type="button"
                        className={styles.documentButton}
                        onClick={() => setActiveDocument("transportOrderAgreement")}
                    >
                        Заявка з перевізником
                    </button>

                    <button
                        type="button"
                        className={styles.documentButton}
                        onClick={() => setActiveDocument("customerOrderAgreement")}
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
                        onClick={() => setActiveDocument("customerForwardingAgreement")}
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

                {activeDocument === "transportOrderAgreement" && <CarrierOrderForm />}
                {activeDocument === "customerOrderAgreement" && <CustomerOrderForm />}
                {activeDocument === "act" && <ActForm />}
                {activeDocument === "invoice" && <InvoiceForm />}
                {activeDocument === "forwarderReport" && <ForwarderReportForm />}
                {activeDocument === "customerForwardingAgreement" && (
                    <ForwardingAgreementForm />
                )}

                {activeDocument === "carrierForwardingAgreement" && (
                    <CarrierForwardingAgreementForm />
                )}
                {activeDocument === "transportCostsCertificate" && (
                    <TransportCostsCertificateForm />
                )}
            </div>
        </section>
    );
}