"use client";

import { useState } from "react";
import styles from "./TransportationForm.module.css";
import { DocumentType } from "./types";
import { CarrierOrderForm } from "./forms/CarrierOrderForm";
import { CustomerOrderForm } from "./forms/CustomerOrderForm";
import { ActForm } from "./forms/ActForm";
import { InvoiceForm } from "./forms/InvoiceForm";

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
                </div>

                {activeDocument === "transportOrderAgreement" && <CarrierOrderForm />}
                {activeDocument === "customerOrderAgreement" && <CustomerOrderForm />}
                {activeDocument === "act" && <ActForm />}
                {activeDocument === "invoice" && <InvoiceForm />}
            </div>
        </section>
    );
}