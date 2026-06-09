"use client";

import {
    Field,
    Form,
    Formik,
    FormikHelpers,
} from "formik";

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
import { TransportCostSegmentsFields } from "../shared/TransportCostSegmentsFields";

export function TransportCostsCertificateForm() {
    const { draft, isLoaded, saveDraft } =
        useTransportationDraft();

    if (!isLoaded) {
        return null;
    }

    const initialValues: FormValues = {
        selectedDocuments: ["transportCostsCertificate"],
        ...initialDraft,
        ...draft,

        transportCostsCustomerCompany:
            draft.transportCostsCustomerCompany ||
            draft.customerCompany,

        transportCostsVehicle:
            draft.transportCostsVehicle ||
            draft.vehicleDetails,
    };

    async function handleSubmit(
        values: FormValues,
        {
            setSubmitting,
            setStatus,
        }: FormikHelpers<FormValues>
    ) {
        try {
            setStatus("");

            const { selectedDocuments, ...data } = values;

            saveDraft(data);

            const blob = await generateDocument(
                "transportCostsCertificate",
                values
            );

            downloadBlob(
                blob,
                sanitizeFileName(
                    `Довідка про транспортні витрати ${values.transportCostsCustomerCompany} ${values.transportCostsCertificateDate}.docx`
                )
            );

            setStatus(
                "Довідку про транспортні витрати згенеровано"
            );
        } catch (error) {
            console.error(error);

            setStatus(
                error instanceof Error
                    ? error.message
                    : "Помилка генерації довідки"
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
                    <div className={styles.grid}>
                        <TextInput
                            name="transportCostsCertificateNumber"
                            label="Номер довідки"
                            placeholder="Б/Н"
                        />

                        <TextInput
                            name="transportCostsCertificateDate"
                            label="Дата довідки"
                            placeholder="29.05.26"
                        />

                        <TextInput
                            name="transportCostsCertificateRecipient"
                            label="Для кого призначена довідка"
                            placeholder="Для надання в митні органи"
                        />

                        <TextInput
                            name="transportCostsCustomerCompany"
                            label="Замовник / одержувач"
                            placeholder='ТОВ "ТрансКомплектімпекс"'
                        />

                        <TextInput
                            name="transportCostsVehicle"
                            label="Автомобіль"
                            placeholder="IVECO, д.н.з. АС 9925 ІА, напівпричіп АС 3634 ХО"
                        />

                        <TransportCostSegmentsFields />

                        <div className={styles.groupFull}>
                            <h2 className={styles.blockTitle}>
                                Додаткові умови
                            </h2>
                        </div>

                        <label className={styles.checkboxGroup}>
                            <Field
                                type="checkbox"
                                name="cargoInsured"
                                className={styles.checkbox}
                            />

                            <span>Вантаж був застрахований</span>
                        </label>

                        <label className={styles.checkboxGroup}>
                            <Field
                                type="checkbox"
                                name="loadingWorksIncluded"
                                className={styles.checkbox}
                            />

                            <span>
                                Вантажно-розвантажувальні роботи
                                входять у вартість
                            </span>
                        </label>
                    </div>

                    <FormActions
                        isSubmitting={isSubmitting}
                        status={status}
                        buttonText="Згенерувати довідку"
                    />
                </Form>
            )}
        </Formik>
    );
}