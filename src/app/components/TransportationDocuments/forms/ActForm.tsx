"use client";

import { Form, Formik, FormikHelpers } from "formik";

import styles from "../TransportationForm.module.css";

import { FormValues } from "../types";
import { initialDraft } from "../initialDraft";
import { useTransportationDraft } from "../hooks/useTransportationDraft";
import { generateDocument } from "../utils/generateDocument";

import { TextInput } from "../shared/TextInput";
import { CustomerFields } from "../shared/CustomerFields";
import { CarrierFields } from "../shared/CarrierFields";
import { TransportationFields } from "../shared/TransportationFields";
import { ServicesFields } from "../shared/ServicesFields";
import { FormActions } from "../shared/FormActions";

type ActFormProps = {
    initialValues?: Partial<FormValues>;
    transportationRecordId?: string;
};

export function ActForm({
                            initialValues: loadedInitialValues,
                            transportationRecordId,
                        }: ActFormProps) {
    const { draft, isLoaded, saveDraft } = useTransportationDraft();

    if (!isLoaded) {
        return null;
    }

    const initialValues: FormValues = {
        selectedDocuments: ["act"],
        ...initialDraft,
        ...draft,
        ...loadedInitialValues,
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

            setStatus("Акт згенеровано та збережено в папку");
        } catch (error) {
            console.error(error);
            setStatus(
                error instanceof Error
                    ? error.message
                    : "Помилка генерації акта"
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