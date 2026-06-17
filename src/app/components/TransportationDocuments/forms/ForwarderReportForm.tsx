"use client";

import { useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";

import styles from "../TransportationForm.module.css";

import { FormValues } from "../types";
import { initialDraft } from "../initialDraft";
import { useTransportationDraft } from "../hooks/useTransportationDraft";
import { generateDocument } from "../utils/generateDocument";

import { TextInput } from "../shared/TextInput";
import { TextArea } from "../shared/TextArea";
import { FormActions } from "../shared/FormActions";

type ForwarderReportFormProps = {
    initialValues?: Partial<FormValues>;
    transportationRecordId?: string;
};

export function ForwarderReportForm({
                                        initialValues: loadedInitialValues,
                                        transportationRecordId,
                                    }: ForwarderReportFormProps) {
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
        selectedDocuments: ["forwarderReport"],
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

            setStatus("Звіт експедитора згенеровано та збережено в папку");
        } catch (error) {
            console.error(error);

            setStatus(
                error instanceof Error
                    ? error.message
                    : "Помилка генерації звіту експедитора"
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
                            name="forwarderReportDate"
                            label="Дата складання звіту"
                            placeholder="25.05.26"
                        />

                        <TextInput
                            name="forwarderReportCity"
                            label="Місто складання звіту"
                            placeholder="Тернопіль"
                        />

                        <TextInput
                            name="forwardingAgreementDetails"
                            label="Дані договору транспортного експедирування"
                            placeholder="№ 15 від «25» Травня 2026 р."
                        />

                        <TextInput
                            name="customerOrderDetails"
                            label="Дані договору-заявки із замовником"
                            placeholder="№25/05/26-1 від «25» Травня 2026 р."
                        />

                        <TextInput
                            name="route"
                            label="Маршрут перевезення"
                            placeholder="Львів — Київ"
                        />

                        <TextArea
                            name="cargoDetails"
                            label="Вантаж"
                            placeholder="Назва вантажу, вага, об’єм, пакування"
                        />

                        <TextArea
                            name="vehicleDetails"
                            label="Автомобіль"
                            placeholder="Марка, номер тягача та причепа"
                        />

                        <TextInput
                            name="actualCarrierCompany"
                            label="Фактичний перевізник"
                            placeholder="ТОВ або ФОП..."
                        />

                        <TextInput
                            name="customerServiceAmount"
                            label="Сума, отримана від замовника"
                            placeholder="27000"
                        />

                        <TextInput
                            name="carrierActDetails"
                            label="Дані акта перевізника"
                            placeholder="№ 12 від «25» Травня 2026 р."
                        />

                        <TextInput
                            name="carrierServiceAmount"
                            label="Сума, сплачена перевізнику"
                            placeholder="23500"
                        />

                        <TextInput
                            name="forwarderRewardAmount"
                            label="Винагорода експедитора"
                            placeholder="3500"
                        />
                    </div>

                    <FormActions
                        isSubmitting={isSubmitting}
                        status={status}
                        buttonText="Згенерувати звіт експедитора"
                        folderRecordId={generatedRecordId}
                    />
                </Form>
            )}
        </Formik>
    );
}