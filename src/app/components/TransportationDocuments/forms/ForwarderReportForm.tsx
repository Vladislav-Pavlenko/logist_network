"use client";

import { Form, Formik, FormikHelpers } from "formik";
import styles from "../TransportationForm.module.css";

import { FormValues } from "../types";
import { initialDraft } from "../initialDraft";
import { useTransportationDraft } from "../hooks/useTransportationDraft";
import { generateDocument, downloadBlob } from "../utils/generateDocument";
import { sanitizeFileName } from "@/app/api/utils/sanitizeFileName";

import { TextInput } from "../shared/TextInput";
import { TextArea } from "../shared/TextArea";
import { FormActions } from "../shared/FormActions";

export function ForwarderReportForm() {
    const { draft, isLoaded, saveDraft } = useTransportationDraft();

    if (!isLoaded) return null;

    const initialValues: FormValues = {
        selectedDocuments: ["forwarderReport"],
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

            const blob = await generateDocument("forwarderReport", values);

            downloadBlob(
                blob,
                sanitizeFileName(
                    `Звіт експедитора ${values.customerCompany} ${values.route} ${values.forwarderReportDate}.docx`
                )
            );

            setStatus("Звіт експедитора згенеровано");
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
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, status }) => (
                <Form className={styles.form}>
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
                    />
                </Form>
            )}
        </Formik>
    );
}