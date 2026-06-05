"use client";

import { Form, Formik, FormikHelpers } from "formik";
import { sanitizeFileName } from "@/app/api/utils/sanitizeFileName";
import styles from "../TransportationForm.module.css";
import { FormValues } from "../types";
import { initialDraft } from "../initialDraft";
import { useTransportationDraft } from "../hooks/useTransportationDraft";
import { generateDocument, downloadBlob } from "../utils/generateDocument";
import { TextInput } from "../shared/TextInput";
import { CarrierFields } from "../shared/CarrierFields";
import { TransportationFields } from "../shared/TransportationFields";
import { FormActions } from "../shared/FormActions";

export function CarrierOrderForm() {
    const { draft, isLoaded, saveDraft } = useTransportationDraft();

    if (!isLoaded) return null;

    const initialValues: FormValues = {
        selectedDocuments: ["transportOrderAgreement"],
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

            const blob = await generateDocument("transportOrderAgreement", values);

            downloadBlob(
                blob,
                sanitizeFileName(
                    `Договір-заявка з перевізником ${values.carrierCompany} ${values.route} ${values.orderDate}.docx`
                )
            );

            setStatus("Заявку з перевізником згенеровано");
        } catch (error) {
            console.error(error);
            setStatus("Помилка генерації заявки з перевізником");
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
                            label="Дата заявки з перевізником"
                            placeholder="12.06.2026-1"
                        />

                        <CarrierFields />
                        <TransportationFields />
                    </div>

                    <FormActions
                        isSubmitting={isSubmitting}
                        status={status}
                        buttonText="Згенерувати заявку з перевізником"
                    />
                </Form>
            )}
        </Formik>
    );
}