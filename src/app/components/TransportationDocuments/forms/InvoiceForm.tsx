"use client";

import { Form, Formik, FormikHelpers } from "formik";

import styles from "../TransportationForm.module.css";

import { FormValues } from "../types";
import { initialDraft } from "../initialDraft";
import { useTransportationDraft } from "../hooks/useTransportationDraft";
import { generateDocument } from "../utils/generateDocument";

import { CustomerFields } from "../shared/CustomerFields";
import { TransportationFields } from "../shared/TransportationFields";
import { ServicesFields } from "../shared/ServicesFields";
import { FormActions } from "../shared/FormActions";
import { TextInput } from "../shared/TextInput";

type InvoiceFormProps = {
    initialValues?: Partial<FormValues>;
    transportationRecordId?: string;
};

export function InvoiceForm({
                                initialValues: loadedInitialValues,
                                transportationRecordId,
                            }: InvoiceFormProps) {
    const { draft, isLoaded, saveDraft } = useTransportationDraft();

    if (!isLoaded) {
        return null;
    }

    const initialValues: FormValues = {
        ...initialDraft,
        ...draft,
        ...loadedInitialValues,
        selectedDocuments: ["invoice"],
    };

    async function handleSubmit(
        values: FormValues,
        { setSubmitting, setStatus }: FormikHelpers<FormValues>
    ) {
        try {
            setStatus("");

            const { selectedDocuments, ...data } = values;

            saveDraft(data);

            await generateDocument(
                selectedDocuments,
                data,
                transportationRecordId
            );

            setStatus("Рахунок згенеровано та збережено в папку");
        } catch (error) {
            console.error(error);

            setStatus(
                error instanceof Error
                    ? error.message
                    : "Помилка генерації рахунку"
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            enableReinitialize
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, status }) => (
                <Form className={styles.form}>
                    {transportationRecordId && (
                        <p className={styles.formNotice}>
                            Документ буде збережено в поточну папку перевезення.
                        </p>
                    )}

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