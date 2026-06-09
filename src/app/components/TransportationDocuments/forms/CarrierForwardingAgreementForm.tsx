"use client";

import { Form, Formik, FormikHelpers } from "formik";

import { sanitizeFileName } from "@/app/api/utils/sanitizeFileName";

import styles from "../TransportationForm.module.css";

import { FormValues } from "../types";
import { initialDraft } from "../initialDraft";
import { useTransportationDraft } from "../hooks/useTransportationDraft";
import {
    downloadBlob,
    generateDocument,
} from "../utils/generateDocument";

import { TextInput } from "../shared/TextInput";
import { FormActions } from "../shared/FormActions";
import { CarrierForwardingAgreementFields } from "../shared/CarrierForwardingAgreementFields";

export function CarrierForwardingAgreementForm() {
    const { draft, isLoaded, saveDraft } = useTransportationDraft();

    if (!isLoaded) {
        return null;
    }

    const initialValues: FormValues = {
        selectedDocuments: ["carrierForwardingAgreement"],
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
                "carrierForwardingAgreement",
                values
            );

            downloadBlob(
                blob,
                sanitizeFileName(
                    `Договір транспортної експедиції з перевізником ${values.carrierCompany} ${values.forwardingAgreementNumber}.docx`
                )
            );

            setStatus(
                "Договір транспортної експедиції з перевізником згенеровано"
            );
        } catch (error) {
            console.error(error);

            setStatus(
                error instanceof Error
                    ? error.message
                    : "Помилка генерації договору з перевізником"
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
                            placeholder="Тернопіль"
                        />

                        <TextInput
                            name="forwardingAgreementValidUntil"
                            label="Договір діє до"
                            placeholder="31.12.26"
                        />

                        <CarrierForwardingAgreementFields />
                    </div>

                    <FormActions
                        isSubmitting={isSubmitting}
                        status={status}
                        buttonText="Згенерувати договір з перевізником"
                    />
                </Form>
            )}
        </Formik>
    );
}