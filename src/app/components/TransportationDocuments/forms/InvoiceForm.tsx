"use client";

import { Form, Formik, FormikHelpers } from "formik";
import { sanitizeFileName } from "@/app/api/utils/sanitizeFileName";
import styles from "../TransportationForm.module.css";
import { FormValues } from "../types";
import { initialDraft } from "../initialDraft";
import { useTransportationDraft } from "../hooks/useTransportationDraft";
import { generateDocument, downloadBlob } from "../utils/generateDocument";
import { CustomerFields } from "../shared/CustomerFields";
import { TransportationFields } from "../shared/TransportationFields";
import { ServicesFields } from "../shared/ServicesFields";
import { FormActions } from "../shared/FormActions";
import {TextInput} from "@/app/components/TransportationDocuments/shared/TextInput";

export function InvoiceForm() {
    const { draft, isLoaded, saveDraft } = useTransportationDraft();

    if (!isLoaded) return null;

    const initialValues: FormValues = {
        selectedDocuments: ["invoice"],
        ...initialDraft,
        ...draft,
    };

    async function handleSubmit(
        values: FormValues,
        { setSubmitting, setStatus }: FormikHelpers<FormValues>
    ) {
        try {
            setStatus("");

            const { selectedDocuments, ...data } = values;
            saveDraft(data);

            const blob = await generateDocument("invoice", values);

            downloadBlob(
                blob,
                sanitizeFileName(
                    `Рахунок ${values.customerCompany} ${values.route}.docx`
                )
            );

            setStatus("Рахунок згенеровано");
        } catch (error) {
            console.error(error);
            setStatus("Помилка генерації рахунку");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Formik<FormValues> initialValues={initialValues} onSubmit={handleSubmit}>
            {({ isSubmitting, status }) => (
                <Form className={styles.form}>
                    <div className={styles.grid}>
                        <TextInput
                            name="invoiceDate"
                            label="Дата складання рахунку"
                            placeholder="25.05.26"
                        />

                        <TextInput
                            name="customerOrderDetails"
                            label="Дані заявки / договору із замовником"
                            placeholder="Договір-заявка №25/05/26-1 від «25» Травня 2026 р."
                        />

                        <CustomerFields />
                        <TransportationFields />
                        <ServicesFields />
                    </div>

                    <FormActions
                        isSubmitting={isSubmitting}
                        status={status}
                        buttonText="Згенерувати рахунок"
                    />
                </Form>
            )}
        </Formik>
    );
}