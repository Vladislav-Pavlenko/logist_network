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
import { CarrierFields } from "../shared/CarrierFields";
import { TransportationFields } from "../shared/TransportationFields";
import { ServicesFields } from "../shared/ServicesFields";
import { FormActions } from "../shared/FormActions";

export function ActForm() {
    const { draft, isLoaded, saveDraft } = useTransportationDraft();

    if (!isLoaded) return null;

    const initialValues: FormValues = {
        selectedDocuments: ["act"],
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

            const blob = await generateDocument("act", values);

            downloadBlob(
                blob,
                sanitizeFileName(
                    `Акт виконаних робіт ${values.customerCompany} ${values.route} ${values.actDate}.docx`
                )
            );

            setStatus("Акт згенеровано");
        } catch (error) {
            console.error(error);
            setStatus("Помилка генерації акта");
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
                            name="actDate"
                            label="Дата складання акта"
                            placeholder="25.05.26"
                        />

                        <TextInput
                            name="customerOrderDetails"
                            label="Дані заявки / договору із замовником"
                            placeholder="Договір-заявка №25/05/26-1 від «25» Травня 2026 р."
                        />

                        <CustomerFields />
                        <CarrierFields />
                        <TransportationFields />
                        <ServicesFields />
                    </div>

                    <FormActions
                        isSubmitting={isSubmitting}
                        status={status}
                        buttonText="Згенерувати акт"
                    />
                </Form>
            )}
        </Formik>
    );
}