"use client";

import { Form, Formik, FormikHelpers } from "formik";
import { sanitizeFileName } from "@/app/api/utils/sanitizeFileName";
import styles from "../TransportationForm.module.css";
import { FormValues } from "../types";
import { initialDraft } from "../initialDraft";
import { useTransportationDraft } from "../hooks/useTransportationDraft";
import { generateDocument, downloadBlob } from "../utils/generateDocument";
import { TextInput } from "../shared/TextInput";
import { CustomerFields } from "../shared/CustomerFields";
import { TransportationFields } from "../shared/TransportationFields";
import { FormActions } from "../shared/FormActions";

export function CustomerOrderForm() {
    const { draft, isLoaded, saveDraft } = useTransportationDraft();

    if (!isLoaded) return null;

    const initialValues: FormValues = {
        selectedDocuments: ["customerOrderAgreement"],
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

            const blob = await generateDocument("customerOrderAgreement", values);

            downloadBlob(
                blob,
                sanitizeFileName(
                    `Договір-заявка із замовником ${values.customerCompany} ${values.route}.docx`
                )
            );

            setStatus("Заявку із замовником згенеровано");
        } catch (error) {
            console.error(error);
            setStatus("Помилка генерації заявки із замовником");
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
                            name="orderDate"
                            label="Дата заявки із замовником"
                            placeholder="12.06.2026-1"
                        />

                        <CustomerFields />
                        <TransportationFields />
                    </div>

                    <FormActions
                        isSubmitting={isSubmitting}
                        status={status}
                        buttonText="Згенерувати заявку із замовником"
                    />
                </Form>
            )}
        </Formik>
    );
}