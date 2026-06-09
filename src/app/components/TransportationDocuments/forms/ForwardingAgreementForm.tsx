"use client";

import { Form, Formik, FormikHelpers } from "formik";
import styles from "../TransportationForm.module.css";

import { FormValues } from "../types";
import { initialDraft } from "../initialDraft";
import { useTransportationDraft } from "../hooks/useTransportationDraft";
import {
    downloadBlob,
    generateDocument,
} from "../utils/generateDocument";

import { sanitizeFileName } from "@/app/api/utils/sanitizeFileName";

import { TextInput } from "../shared/TextInput";
import { ForwardingAgreementCustomerFields } from "../shared/ForwardingAgreementCustomerFields";
import { FormActions } from "../shared/FormActions";

export function ForwardingAgreementForm() {
    const { draft, isLoaded, saveDraft } = useTransportationDraft();

    if (!isLoaded) {
        return null;
    }

    const initialValues: FormValues = {
        selectedDocuments: ["customerForwardingAgreement"],
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

            const blob = await generateDocument(
                "customerForwardingAgreement",
                values
            );

            downloadBlob(
                blob,
                sanitizeFileName(
                    `Договір транспортної експедиції ${values.customerCompany} ${values.forwardingAgreementNumber}.docx`
                )
            );

            setStatus("Договір транспортної експедиції згенеровано");
        } catch (error) {
            console.error(error);

            setStatus(
                error instanceof Error
                    ? error.message
                    : "Помилка генерації договору"
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, status }) => (
                <Form className={styles.form}>
                    <div className={styles.grid}>
                        <TextInput
                            name="forwardingAgreementNumber"
                            label="Номер договору"
                            placeholder="Наприклад, UA-006"
                        />

                        <TextInput
                            name="forwardingAgreementDate"
                            label="Дата договору"
                            placeholder="26.05.26"
                        />

                        <TextInput
                            name="forwardingAgreementCity"
                            label="Місто укладення договору"
                            placeholder="Житомир"
                        />

                        <TextInput
                            name="forwardingAgreementValidUntil"
                            label="Договір діє до"
                            placeholder="31.12.26"
                        />

                        <ForwardingAgreementCustomerFields />
                    </div>

                    <FormActions
                        isSubmitting={isSubmitting}
                        status={status}
                        buttonText="Згенерувати договір з замовником"
                    />
                </Form>
            )}
        </Formik>
    );
}