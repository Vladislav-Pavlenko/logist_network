"use client";

import { Form, Formik, FormikHelpers } from "formik";

import styles from "../TransportationForm.module.css";

import { FormValues } from "../types";
import { initialDraft } from "../initialDraft";
import { useTransportationDraft } from "../hooks/useTransportationDraft";
import { generateDocument } from "../utils/generateDocument";

import { TextInput } from "../shared/TextInput";
import { CarrierFields } from "../shared/CarrierFields";
import { TransportationFields } from "../shared/TransportationFields";
import { FormActions } from "../shared/FormActions";

type CarrierOrderFormProps = {
    initialValues?: Partial<FormValues>;
    transportationRecordId?: string;
};

export function CarrierOrderForm({
                                     initialValues: loadedInitialValues,
                                     transportationRecordId,
                                 }: CarrierOrderFormProps) {
    const { draft, isLoaded, saveDraft } = useTransportationDraft();

    if (!isLoaded) {
        return null;
    }

    const initialValues: FormValues = {
        ...initialDraft,
        ...draft,
        ...loadedInitialValues,
        selectedDocuments: ["transportOrderAgreement"],
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

            setStatus("Заявку з перевізником згенеровано та збережено в папку");
        } catch (error) {
            console.error(error);

            setStatus(
                error instanceof Error
                    ? error.message
                    : "Помилка генерації заявки з перевізником"
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