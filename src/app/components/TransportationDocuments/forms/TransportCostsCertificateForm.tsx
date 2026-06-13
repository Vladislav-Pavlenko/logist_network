"use client";

import { Field, Form, Formik, FormikHelpers } from "formik";

import styles from "../TransportationForm.module.css";

import { FormValues } from "../types";
import { initialDraft } from "../initialDraft";
import { useTransportationDraft } from "../hooks/useTransportationDraft";
import { generateDocument } from "../utils/generateDocument";

import { TextInput } from "../shared/TextInput";
import { FormActions } from "../shared/FormActions";
import { TransportCostSegmentsFields } from "../shared/TransportCostSegmentsFields";

type TransportCostsCertificateFormProps = {
    initialValues?: Partial<FormValues>;
    transportationRecordId?: string;
};

export function TransportCostsCertificateForm({
                                                  initialValues: loadedInitialValues,
                                                  transportationRecordId,
                                              }: TransportCostsCertificateFormProps) {
    const { draft, isLoaded, saveDraft } = useTransportationDraft();

    if (!isLoaded) {
        return null;
    }

    const mergedValues = {
        ...initialDraft,
        ...draft,
        ...loadedInitialValues,
    };

    const initialValues: FormValues = {
        ...mergedValues,
        selectedDocuments: ["transportCostsCertificate"],

        transportCostsCustomerCompany:
            mergedValues.transportCostsCustomerCompany ||
            mergedValues.customerCompany,

        transportCostsVehicle:
            mergedValues.transportCostsVehicle || mergedValues.vehicleDetails,
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

            setStatus("Довідку про транспортні витрати згенеровано та збережено в папку");
        } catch (error) {
            console.error(error);

            setStatus(
                error instanceof Error
                    ? error.message
                    : "Помилка генерації довідки про транспортні витрати"
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
                                Вантажно-розвантажувальні роботи входять у
                                вартість
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