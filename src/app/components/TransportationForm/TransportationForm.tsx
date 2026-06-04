"use client";

import axios from "axios";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import styles from "./TransportationForm.module.css";
import {sanitizeFileName} from "@/app/api/utils/sanitizeFileName";

type FormValues = {
    orderDate: string;
    isInternational: boolean;
    carrierCompany: string;
    carriersRepresentative: string;
    basisOfAuthority: string;
    loadingDateAndTime: string;
    loadingDetails: string;
    unloadingDetails: string;
    route: string;
    cargoDetails: string;
    vehicleDetails: string;
    driverDetails: string;
    driversLicenseDetails: string;
    loadingUnloadingMethod: string;
    paymentDetails: string;
    deliveryDeadline: string;
    otherDetails: string;
    cmrCount: string;
    bankDetails: string;
    carrierSignatureName: string,
};

const initialValues: FormValues = {
    orderDate: "",
    isInternational: false,
    carrierCompany: "",
    carriersRepresentative: "",
    basisOfAuthority: "",
    loadingDateAndTime: "",
    loadingDetails: "",
    unloadingDetails: "",
    route: "",
    cargoDetails: "",
    vehicleDetails: "",
    driverDetails: "",
    driversLicenseDetails: "",
    loadingUnloadingMethod: "",
    paymentDetails: "",
    deliveryDeadline: "",
    otherDetails: "",
    cmrCount: "",
    bankDetails: "",
    carrierSignatureName: "",
};

const validationSchema = Yup.object({
    orderDate: Yup.string().required("Вкажи дату заявки"),

    isInternational: Yup.boolean().required(),

    carrierCompany: Yup.string()
        .trim()
        .required("Вкажи організацію перевізника"),

    carriersRepresentative: Yup.string()
        .trim()
        .required("Вкажи керівника або представника"),

    basisOfAuthority: Yup.string()
        .trim()
        .required("Вкажи на підставі чого діє організація"),

    loadingDateAndTime: Yup.string()
        .trim()
        .required("Вкажи дату та час завантаження"),

    loadingDetails: Yup.string()
        .trim()
        .required("Вкажи дані завантаження"),

    unloadingDetails: Yup.string()
        .trim()
        .required("Вкажи дані розвантаження"),

    route: Yup.string()
        .trim()
        .required("Вкажи маршрут"),

    cargoDetails: Yup.string()
        .trim()
        .required("Вкажи опис вантажу"),

    vehicleDetails: Yup.string()
        .trim()
        .required("Вкажи дані автомобіля"),

    driverDetails: Yup.string()
        .trim()
        .required("Вкажи дані водія"),

    driversLicenseDetails: Yup.string()
        .trim()
        .required("Вкажи дані посвідчення водія"),

    loadingUnloadingMethod: Yup.string()
        .trim()
        .required("Вкажи спосіб завантаження/розвантаження"),

    paymentDetails: Yup.string()
        .trim()
        .required("Вкажи умови оплати"),

    deliveryDeadline: Yup.string()
        .trim()
        .required("Вкажи термін виконання перевезення"),

    otherDetails: Yup.string().trim(),

    cmrCount: Yup.string()
        .trim()
        .required("Вкажи кількість CMR"),

    bankDetails: Yup.string()
        .trim()
        .required("Вкажи реквізити"),

    carrierSignatureName: Yup.string()
        .trim()
        .required("Вкажи ПІБ для підпису"),
});

export default function TransportationForm() {
    async function handleSubmit(
        values: FormValues,
        { setSubmitting, setStatus }: FormikHelpers<FormValues>
    ) {
        try {
            setStatus("");

            const response = await axios.post<Blob>("/api/generate-transport-order-agreement", values, {
                responseType: "blob",
            });

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });

            const url = URL.createObjectURL(blob);



            const link = document.createElement("a");
            link.href = url;
            link.download = sanitizeFileName(
                `Договір-заявка з перевізником ${values.carrierCompany} ${values.route} ${values.orderDate}.docx`
            );

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            setStatus("Заявку успішно згенеровано");
        } catch (error) {
            console.error(error);
            setStatus("Помилка генерації заявки");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Заявка на перевезення</h1>
                    <p className={styles.subtitle}>
                        Заповни дані, після чого система сформує готовий Word-документ.
                    </p>
                </div>

                <Formik<FormValues>
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, status }) => (
                        <Form className={styles.form}>
                            <div className={styles.grid}>
                                <div className={styles.group}>
                                    <label className={styles.label} htmlFor="orderDate">
                                        Дата заявки
                                    </label>
                                    <Field
                                        className={styles.input}
                                        id="orderDate"
                                        name="orderDate"
                                        type="text"
                                        placeholder="12.06.2026-1"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="orderDate"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.group}>
                                    <label className={styles.label} htmlFor="orderDate">
                                        Тип перевезення
                                    </label>
                                    <label className={styles.checkboxGroup}>
                                        <Field
                                            className={styles.checkbox}
                                            name="isInternational"
                                            type="checkbox"
                                        />
                                        <span>Міжнародне перевезення</span>
                                    </label>
                                    <ErrorMessage
                                        className={styles.error}
                                        name="isInternational"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.group}>
                                    <label className={styles.label} htmlFor="carrierCompany">
                                        Організація перевізника
                                    </label>
                                    <Field
                                        className={styles.input}
                                        id="carrierCompany"
                                        name="carrierCompany"
                                        type="text"
                                        placeholder="Наприклад, ТОВ..."
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="carrierCompany"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.group}>
                                    <label
                                        className={styles.label}
                                        htmlFor="carriersRepresentative"
                                    >
                                        Керівник / представник
                                    </label>
                                    <Field
                                        className={styles.input}
                                        id="carriersRepresentative"
                                        name="carriersRepresentative"
                                        type="text"
                                        placeholder="ПІБ представника"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="carriersRepresentative"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.group}>
                                    <label className={styles.label} htmlFor="basisOfAuthority">
                                        На підставі чого діє
                                    </label>
                                    <Field
                                        className={styles.input}
                                        id="basisOfAuthority"
                                        name="basisOfAuthority"
                                        type="text"
                                        placeholder="Статуту, довіреності тощо"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="basisOfAuthority"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.group}>
                                    <label className={styles.label} htmlFor="loadingDateAndTime">
                                        Дата та час завантаження
                                    </label>
                                    <Field
                                        className={styles.input}
                                        id="loadingDateAndTime"
                                        name="loadingDateAndTime"
                                        type="text"
                                        placeholder="04.06.2026р., 14:00"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="loadingDateAndTime"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.groupFull}>
                                    <label className={styles.label} htmlFor="loadingDetails">
                                        Завантаження
                                    </label>
                                    <Field
                                        className={styles.textarea}
                                        id="loadingDetails"
                                        name="loadingDetails"
                                        as="textarea"
                                        placeholder="Адреса завантаження, контактна особа, телефон"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="loadingDetails"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.groupFull}>
                                    <label className={styles.label} htmlFor="unloadingDetails">
                                        Розвантаження
                                    </label>
                                    <Field
                                        className={styles.textarea}
                                        id="unloadingDetails"
                                        name="unloadingDetails"
                                        as="textarea"
                                        placeholder="Адреса розвантаження, контактна особа, телефон"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="unloadingDetails"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.groupFull}>
                                    <label className={styles.label} htmlFor="route">
                                        Маршрут
                                    </label>
                                    <Field
                                        className={styles.input}
                                        id="route"
                                        name="route"
                                        type="text"
                                        placeholder="Львів — Київ"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="route"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.groupFull}>
                                    <label className={styles.label} htmlFor="cargoDetails">
                                        Опис вантажу
                                    </label>
                                    <Field
                                        className={styles.textarea}
                                        id="cargoDetails"
                                        name="cargoDetails"
                                        as="textarea"
                                        placeholder="Назва вантажу, вага/обʼєм, тип пакування"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="cargoDetails"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.groupFull}>
                                    <label className={styles.label} htmlFor="vehicleDetails">
                                        Дані автомобіля
                                    </label>
                                    <Field
                                        className={styles.textarea}
                                        id="vehicleDetails"
                                        name="vehicleDetails"
                                        as="textarea"
                                        placeholder="Марка, модель, номер авто, причіп"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="vehicleDetails"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.groupFull}>
                                    <label className={styles.label} htmlFor="driverDetails">
                                        Дані водія
                                    </label>
                                    <Field
                                        className={styles.textarea}
                                        id="driverDetails"
                                        name="driverDetails"
                                        as="textarea"
                                        placeholder="ПІБ водія, телефон, паспортні дані за потреби"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="driverDetails"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.groupFull}>
                                    <label
                                        className={styles.label}
                                        htmlFor="driversLicenseDetails"
                                    >
                                        Посвідчення водія
                                    </label>
                                    <Field
                                        className={styles.textarea}
                                        id="driversLicenseDetails"
                                        name="driversLicenseDetails"
                                        as="textarea"
                                        placeholder="Серія, номер, дата видачі"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="driversLicenseDetails"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.group}>
                                    <label
                                        className={styles.label}
                                        htmlFor="loadingUnloadingMethod"
                                    >
                                        Спосіб завантаження/розвантаження
                                    </label>
                                    <Field
                                        className={styles.input}
                                        id="loadingUnloadingMethod"
                                        name="loadingUnloadingMethod"
                                        type="text"
                                        placeholder="Бічне, заднє, верхнє тощо"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="loadingUnloadingMethod"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.group}>
                                    <label className={styles.label} htmlFor="deliveryDeadline">
                                        Термін виконання перевезення
                                    </label>
                                    <Field
                                        className={styles.input}
                                        id="deliveryDeadline"
                                        name="deliveryDeadline"
                                        type="text"
                                        placeholder="До 05.06.2026, 03:30"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="deliveryDeadline"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.groupFull}>
                                    <label className={styles.label} htmlFor="paymentDetails">
                                        Умови оплати
                                    </label>
                                    <Field
                                        className={styles.textarea}
                                        id="paymentDetails"
                                        name="paymentDetails"
                                        as="textarea"
                                        placeholder="Сума, форма оплати, термін оплати"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="paymentDetails"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.group}>
                                    <label className={styles.label} htmlFor="cmrCount">
                                        Кількість CMR
                                    </label>
                                    <Field
                                        className={styles.input}
                                        id="cmrCount"
                                        name="cmrCount"
                                        type="text"
                                        placeholder="Наприклад, 4"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="cmrCount"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.groupFull}>
                                    <label className={styles.label} htmlFor="bankDetails">
                                        Реквізити
                                    </label>
                                    <Field
                                        className={styles.textarea}
                                        id="bankDetails"
                                        name="bankDetails"
                                        as="textarea"
                                        placeholder="IBAN, ЄДРПОУ/РНОКПП, банк, отримувач"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="bankDetails"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.group}>
                                    <label className={styles.label} htmlFor="carrierSignatureName">
                                        ПІБ для підпису
                                    </label>

                                    <Field
                                        className={styles.input}
                                        id="carrierSignatureName"
                                        name="carrierSignatureName"
                                        type="text"
                                        placeholder="Наприклад, В.В. Ковернега"
                                    />

                                    <ErrorMessage
                                        className={styles.error}
                                        name="carrierSignatureName"
                                        component="p"
                                    />
                                </div>

                                <div className={styles.groupFull}>
                                    <label className={styles.label} htmlFor="otherDetails">
                                        Інші умови
                                    </label>
                                    <Field
                                        className={styles.textarea}
                                        id="otherDetails"
                                        name="otherDetails"
                                        as="textarea"
                                        placeholder="Додаткові умови, примітки, вимоги"
                                    />
                                    <ErrorMessage
                                        className={styles.error}
                                        name="otherDetails"
                                        component="p"
                                    />
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    className={styles.button}
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Генерація..." : "Згенерувати заявку"}
                                </button>

                                {status && <p className={styles.status}>{status}</p>}
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </section>
    );
}