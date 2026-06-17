"use client";

import { useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";

import styles from "../TransportationForm.module.css";

import { FormValues } from "../types";
import { initialDraft } from "../initialDraft";
import { useTransportationDraft } from "../hooks/useTransportationDraft";
import { generateDocument } from "../utils/generateDocument";

import { TextInput } from "../shared/TextInput";
import { ForwardingAgreementCustomerFields } from "../shared/ForwardingAgreementCustomerFields";
import { FormActions } from "../shared/FormActions";

type ForwardingAgreementFormProps = {
    initialValues?: Partial<FormValues>;
    transportationRecordId?: string;
};

export function ForwardingAgreementForm({
                                            initialValues: loadedInitialValues,
                                            transportationRecordId,
                                        }: ForwardingAgreementFormProps) {
    const { draft, isLoaded, saveDraft } = useTransportationDraft();

    const [generatedRecordId, setGeneratedRecordId] = useState<string | null>(
        null
    );

    if (!isLoaded) {
        return null;
    }

    const initialValues: FormValues = {
        ...initialDraft,
        ...draft,
        ...loadedInitialValues,
        selectedDocuments: ["customerForwardingAgreement"],
    };

    async function handleSubmit(
        values: FormValues,
        { setSubmitting, setStatus }: FormikHelpers<FormValues>
    ) {
        try {
            setStatus("");
            setGeneratedRecordId(null);

            const { selectedDocuments, ...data } = values;

            saveDraft(data);

            const result = await generateDocument(
                selectedDocuments,
                data,
                transportationRecordId
            );

            setGeneratedRecordId(result.recordId);

            setStatus(
                "Договір транспортної експедиції з замовником згенеровано та збережено в папку"
            );
        } catch (error) {
            console.error(error);

            setStatus(
                error instanceof Error
                    ? error.message
                    : "Помилка генерації договору з замовником"
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
                        folderRecordId={generatedRecordId}
                    />
                </Form>
            )}
        </Formik>
    );
}