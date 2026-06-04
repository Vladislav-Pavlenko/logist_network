"use client";

import axios from "axios";
import {
    ErrorMessage,
    Field,
    FieldArray,
    Form,
    Formik,
    FormikHelpers,
} from "formik";
import * as Yup from "yup";
import styles from "./TransportationForm.module.css";
import { sanitizeFileName } from "@/app/api/utils/sanitizeFileName";

type DocumentType =
    | "transportOrderAgreement"
    | "customerOrderAgreement"
    | "act"
    | "invoice";

type VatMode = "withoutVat" | "withVat";

const documentOptions: { value: DocumentType; label: string }[] = [
    {
        value: "transportOrderAgreement",
        label: "Договір-заявка з перевізником",
    },
    {
        value: "customerOrderAgreement",
        label: "Договір-заявка із замовником",
    },
    {
        value: "act",
        label: "Акт виконаних робіт",
    },
    {
        value: "invoice",
        label: "Рахунок",
    },
];

type ServiceItem = {
    route: string;
    vehicle: string;
    quantity: string;
    unit: string;
    price: string;
    amount: string;
};

type FormValues = {
    selectedDocuments: DocumentType[];

    orderDate: string;
    actDate: string;
    isInternational: boolean;
    vatMode: VatMode;

    customerCompany: string;
    customerRepresentative: string;
    customerBasisOfAuthority: string;
    customerPaymentDetails: string;
    customerBankDetails: string;
    customerSignatureName: string;

    carrierCompany: string;
    carriersRepresentative: string;
    basisOfAuthority: string;
    carrierPaymentDetails: string;
    carrierBankDetails: string;
    carrierSignatureName: string;

    loadingDateAndTime: string;
    loadingDetails: string;
    unloadingDetails: string;
    route: string;
    cargoDetails: string;
    vehicleDetails: string;
    driverDetails: string;
    driversLicenseDetails: string;
    loadingUnloadingMethod: string;
    deliveryDeadline: string;
    otherDetails: string;
    cmrCount: string;

    services: ServiceItem[];
};

const initialValues: FormValues = {
    selectedDocuments: ["transportOrderAgreement"],

    orderDate: "",
    actDate: "",
    isInternational: false,
    vatMode: "withoutVat",

    customerCompany: "",
    customerRepresentative: "",
    customerBasisOfAuthority: "",
    customerPaymentDetails: "",
    customerBankDetails: "",
    customerSignatureName: "",

    carrierCompany: "",
    carriersRepresentative: "",
    basisOfAuthority: "",
    carrierPaymentDetails: "",
    carrierBankDetails: "",
    carrierSignatureName: "",

    loadingDateAndTime: "",
    loadingDetails: "",
    unloadingDetails: "",
    route: "",
    cargoDetails: "",
    vehicleDetails: "",
    driverDetails: "",
    driversLicenseDetails: "",
    loadingUnloadingMethod: "",
    deliveryDeadline: "",
    otherDetails: "",
    cmrCount: "",

    services: [
        {
            route: "",
            vehicle: "",
            quantity: "1",
            unit: "послуга",
            price: "",
            amount: "",
        },
    ],
};

const validationSchema = Yup.object({
    selectedDocuments: Yup.array()
        .of(Yup.string().required())
        .min(1, "Вибери хоча б один документ")
        .required("Вибери документ"),

    orderDate: Yup.string().required("Вкажи дату заявки"),
    actDate: Yup.string().required("Вкажи дату складання акта"),

    isInternational: Yup.boolean().required(),

    vatMode: Yup.string()
        .oneOf(["withoutVat", "withVat"])
        .required("Вибери режим ПДВ"),

    customerCompany: Yup.string()
        .trim()
        .required("Вкажи організацію замовника"),

    customerRepresentative: Yup.string()
        .trim()
        .required("Вкажи керівника або представника замовника"),

    customerBasisOfAuthority: Yup.string()
        .trim()
        .required("Вкажи на підставі чого діє замовник"),

    customerPaymentDetails: Yup.string()
        .trim()
        .required("Вкажи умови оплати із замовником"),

    customerBankDetails: Yup.string()
        .trim()
        .required("Вкажи реквізити замовника"),

    customerSignatureName: Yup.string()
        .trim()
        .required("Вкажи ПІБ для підпису замовника"),

    carrierCompany: Yup.string()
        .trim()
        .required("Вкажи організацію перевізника"),

    carriersRepresentative: Yup.string()
        .trim()
        .required("Вкажи керівника або представника перевізника"),

    basisOfAuthority: Yup.string()
        .trim()
        .required("Вкажи на підставі чого діє перевізник"),

    carrierPaymentDetails: Yup.string()
        .trim()
        .required("Вкажи умови оплати перевізнику"),

    carrierBankDetails: Yup.string()
        .trim()
        .required("Вкажи реквізити перевізника"),

    carrierSignatureName: Yup.string()
        .trim()
        .required("Вкажи ПІБ для підпису перевізника"),

    loadingDateAndTime: Yup.string()
        .trim()
        .required("Вкажи дату та час завантаження"),

    loadingDetails: Yup.string()
        .trim()
        .required("Вкажи дані завантаження"),

    unloadingDetails: Yup.string()
        .trim()
        .required("Вкажи дані розвантаження"),

    route: Yup.string().trim().required("Вкажи маршрут"),

    cargoDetails: Yup.string().trim().required("Вкажи опис вантажу"),

    vehicleDetails: Yup.string().trim().required("Вкажи дані автомобіля"),

    driverDetails: Yup.string().trim().required("Вкажи дані водія"),

    driversLicenseDetails: Yup.string()
        .trim()
        .required("Вкажи дані посвідчення водія"),

    loadingUnloadingMethod: Yup.string()
        .trim()
        .required("Вкажи спосіб завантаження/розвантаження"),

    deliveryDeadline: Yup.string()
        .trim()
        .required("Вкажи термін виконання перевезення"),

    cmrCount: Yup.string().trim().required("Вкажи кількість CMR"),

    otherDetails: Yup.string().trim(),

    services: Yup.array()
        .of(
            Yup.object({
                route: Yup.string().trim().required("Вкажи маршрут послуги"),
                vehicle: Yup.string().trim().required("Вкажи транспорт"),
                quantity: Yup.string().trim().required("Вкажи кількість"),
                unit: Yup.string().trim().required("Вкажи одиницю виміру"),
                price: Yup.string().trim().required("Вкажи ціну"),
                amount: Yup.string().trim().required("Вкажи суму"),
            })
        )
        .min(1, "Додай хоча б одну послугу")
        .required("Додай хоча б одну послугу"),
});

type TextInputProps = {
    name: keyof FormValues;
    label: string;
    placeholder?: string;
    type?: string;
};

function TextInput({
                       name,
                       label,
                       placeholder,
                       type = "text",
                   }: TextInputProps) {
    return (
        <div className={styles.group}>
            <label className={styles.label} htmlFor={name}>
                {label}
            </label>

            <Field
                className={styles.input}
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
            />

            <ErrorMessage className={styles.error} name={name} component="p" />
        </div>
    );
}

type TextAreaProps = {
    name: keyof FormValues;
    label: string;
    placeholder?: string;
};

function TextArea({ name, label, placeholder }: TextAreaProps) {
    return (
        <div className={styles.groupFull}>
            <label className={styles.label} htmlFor={name}>
                {label}
            </label>

            <Field
                className={styles.textarea}
                id={name}
                name={name}
                as="textarea"
                placeholder={placeholder}
            />

            <ErrorMessage className={styles.error} name={name} component="p" />
        </div>
    );
}

export default function TransportationForm() {
    async function handleSubmit(
        values: FormValues,
        { setSubmitting, setStatus }: FormikHelpers<FormValues>
    ) {
        try {
            setStatus("");

            const { selectedDocuments, ...documentData } = values;

            const response = await axios.post<Blob>(
                "/api/generate-selected-documents",
                {
                    selectedDocuments,
                    data: documentData,
                },
                {
                    responseType: "blob",
                }
            );

            const isZip = selectedDocuments.length > 1;

            const blob = new Blob([response.data], {
                type: isZip
                    ? "application/zip"
                    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });

            const url = URL.createObjectURL(blob);

            const selectedDocumentLabel =
                documentOptions.find((item) => item.value === selectedDocuments[0])
                    ?.label || "Документ";

            const link = document.createElement("a");
            link.href = url;
            link.download = sanitizeFileName(
                isZip
                    ? `Документи ${values.route} ${values.orderDate}.zip`
                    : `${selectedDocumentLabel} ${values.route} ${values.orderDate}.docx`
            );

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            setStatus(
                isZip
                    ? "Документи успішно згенеровано"
                    : "Документ успішно згенеровано"
            );
        } catch (error) {
            console.error(error);
            setStatus("Помилка генерації документів");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Документація</h1>
                    <p className={styles.subtitle}>
                        Заповни дані, вибери потрібні документи, після чого система
                        сформує готовий Word-файл або ZIP-архів.
                    </p>
                </div>

                <Formik<FormValues>
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, status, values, setFieldValue }) => (
                        <Form className={styles.form}>
                            <div className={styles.groupFull}>
                                <p className={styles.label}>Які документи сформувати</p>

                                <div className={styles.checkboxList}>
                                    {documentOptions.map((item) => (
                                        <label className={styles.checkboxGroup} key={item.value}>
                                            <Field
                                                className={styles.checkbox}
                                                type="checkbox"
                                                name="selectedDocuments"
                                                value={item.value}
                                            />
                                            <span>{item.label}</span>
                                        </label>
                                    ))}
                                </div>

                                <ErrorMessage
                                    className={styles.error}
                                    name="selectedDocuments"
                                    component="p"
                                />
                            </div>

                            <div className={styles.grid}>
                                <TextInput
                                    name="orderDate"
                                    label="Дата складання заявки"
                                    placeholder="12.06.2026-1"
                                />

                                <TextInput
                                    name="actDate"
                                    label="Дата складання акта"
                                    placeholder="12.06.2026-1"
                                />

                                <div className={styles.group}>
                                    <label className={styles.label}>Тип перевезення</label>

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

                                <div className={styles.groupFull}>
                                    <h2 className={styles.blockTitle}>Дані замовника</h2>
                                </div>

                                <TextInput
                                    name="customerCompany"
                                    label="Організація замовника"
                                    placeholder="Наприклад, ТОВ..."
                                />

                                <TextInput
                                    name="customerRepresentative"
                                    label="Керівник / представник замовника"
                                    placeholder="ПІБ представника"
                                />

                                <TextInput
                                    name="customerBasisOfAuthority"
                                    label="На підставі чого діє замовник"
                                    placeholder="Статуту, довіреності тощо"
                                />

                                <TextInput
                                    name="customerSignatureName"
                                    label="ПІБ для підпису замовника"
                                    placeholder="Наприклад, І.Г. Дорош"
                                />

                                <TextArea
                                    name="customerPaymentDetails"
                                    label="Умови оплати із замовником"
                                    placeholder="Сума, форма оплати, термін оплати"
                                />

                                <TextArea
                                    name="customerBankDetails"
                                    label="Реквізити замовника"
                                    placeholder="IBAN, ЄДРПОУ/РНОКПП, банк, отримувач"
                                />

                                <div className={styles.groupFull}>
                                    <h2 className={styles.blockTitle}>Дані перевізника</h2>
                                </div>

                                <TextInput
                                    name="carrierCompany"
                                    label="Організація перевізника"
                                    placeholder="Наприклад, ФОП..."
                                />

                                <TextInput
                                    name="carriersRepresentative"
                                    label="Керівник / представник перевізника"
                                    placeholder="ПІБ представника"
                                />

                                <TextInput
                                    name="basisOfAuthority"
                                    label="На підставі чого діє перевізник"
                                    placeholder="Статуту, довіреності тощо"
                                />

                                <TextInput
                                    name="carrierSignatureName"
                                    label="ПІБ для підпису перевізника"
                                    placeholder="Наприклад, В.В. Ковернега"
                                />

                                <TextArea
                                    name="carrierPaymentDetails"
                                    label="Умови оплати перевізнику"
                                    placeholder="Сума, форма оплати, термін оплати"
                                />

                                <TextArea
                                    name="carrierBankDetails"
                                    label="Реквізити перевізника"
                                    placeholder="IBAN, ЄДРПОУ/РНОКПП, банк, отримувач"
                                />

                                <div className={styles.groupFull}>
                                    <h2 className={styles.blockTitle}>Дані перевезення</h2>
                                </div>

                                <TextInput
                                    name="loadingDateAndTime"
                                    label="Дата та час завантаження"
                                    placeholder="04.06.2026р., 14:00"
                                />

                                <TextInput
                                    name="route"
                                    label="Маршрут"
                                    placeholder="Львів — Київ"
                                />

                                <TextArea
                                    name="loadingDetails"
                                    label="Завантаження"
                                    placeholder="Адреса завантаження, контактна особа, телефон"
                                />

                                <TextArea
                                    name="unloadingDetails"
                                    label="Розвантаження"
                                    placeholder="Адреса розвантаження, контактна особа, телефон"
                                />

                                <TextArea
                                    name="cargoDetails"
                                    label="Опис вантажу"
                                    placeholder="Назва вантажу, вага/обʼєм, тип пакування"
                                />

                                <TextArea
                                    name="vehicleDetails"
                                    label="Дані автомобіля"
                                    placeholder="Марка, модель, номер авто, причіп"
                                />

                                <TextArea
                                    name="driverDetails"
                                    label="Дані водія"
                                    placeholder="ПІБ водія, телефон, паспортні дані за потреби"
                                />

                                <TextArea
                                    name="driversLicenseDetails"
                                    label="Посвідчення водія"
                                    placeholder="Серія, номер, дата видачі"
                                />

                                <TextInput
                                    name="loadingUnloadingMethod"
                                    label="Спосіб завантаження/розвантаження"
                                    placeholder="Бічне, заднє, верхнє тощо"
                                />

                                <TextInput
                                    name="deliveryDeadline"
                                    label="Термін виконання перевезення"
                                    placeholder="До 05.06.2026, 03:30"
                                />

                                <TextInput
                                    name="cmrCount"
                                    label="Кількість CMR"
                                    placeholder="Наприклад, 4"
                                />

                                <TextArea
                                    name="otherDetails"
                                    label="Інші умови"
                                    placeholder="Додаткові умови, примітки, вимоги"
                                />

                                <div className={styles.groupFull}>
                                    <h2 className={styles.blockTitle}>
                                        Послуги для акта / рахунку
                                    </h2>
                                </div>

                                <div className={styles.groupFull}>
                                    <p className={styles.label}>ПДВ для акта / рахунку</p>

                                    <div className={styles.checkboxList}>
                                        <label className={styles.checkboxGroup}>
                                            <Field
                                                className={styles.checkbox}
                                                type="radio"
                                                name="vatMode"
                                                value="withoutVat"
                                            />
                                            <span>Без ПДВ</span>
                                        </label>

                                        <label className={styles.checkboxGroup}>
                                            <Field
                                                className={styles.checkbox}
                                                type="radio"
                                                name="vatMode"
                                                value="withVat"
                                            />
                                            <span>З ПДВ</span>
                                        </label>
                                    </div>

                                    <ErrorMessage
                                        className={styles.error}
                                        name="vatMode"
                                        component="p"
                                    />
                                </div>

                                <FieldArray name="services">
                                    {({ push, remove }) => (
                                        <div className={styles.groupFull}>
                                            {values.services.map((_, index) => (
                                                <div className={styles.serviceCard} key={index}>
                                                    <div className={styles.serviceHeader}>
                                                        <h3 className={styles.serviceTitle}>
                                                            Позиція {index + 1}
                                                        </h3>

                                                        <div className={styles.serviceActions}>
                                                            <button
                                                                type="button"
                                                                className={styles.secondaryButton}
                                                                onClick={() => {
                                                                    setFieldValue(
                                                                        `services.${index}.route`,
                                                                        values.route
                                                                    );
                                                                    setFieldValue(
                                                                        `services.${index}.vehicle`,
                                                                        values.vehicleDetails
                                                                    );
                                                                }}
                                                            >
                                                                Підтягнути маршрут і транспорт
                                                            </button>

                                                            {values.services.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    className={styles.removeButton}
                                                                    onClick={() => remove(index)}
                                                                >
                                                                    Видалити
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className={styles.grid}>
                                                        <div className={styles.groupFull}>
                                                            <label
                                                                className={styles.label}
                                                                htmlFor={`services.${index}.route`}
                                                            >
                                                                Маршрут послуги
                                                            </label>

                                                            <Field
                                                                className={styles.input}
                                                                id={`services.${index}.route`}
                                                                name={`services.${index}.route`}
                                                                type="text"
                                                                placeholder="Польща, с. Ясениця - ПП Грушів"
                                                            />

                                                            <ErrorMessage
                                                                className={styles.error}
                                                                name={`services.${index}.route`}
                                                                component="p"
                                                            />
                                                        </div>

                                                        <div className={styles.groupFull}>
                                                            <label
                                                                className={styles.label}
                                                                htmlFor={`services.${index}.vehicle`}
                                                            >
                                                                Транспорт
                                                            </label>

                                                            <Field
                                                                className={styles.input}
                                                                id={`services.${index}.vehicle`}
                                                                name={`services.${index}.vehicle`}
                                                                type="text"
                                                                placeholder="FIAT DUCATO №А/М ВС 3488 НК"
                                                            />

                                                            <ErrorMessage
                                                                className={styles.error}
                                                                name={`services.${index}.vehicle`}
                                                                component="p"
                                                            />
                                                        </div>

                                                        <div className={styles.group}>
                                                            <label
                                                                className={styles.label}
                                                                htmlFor={`services.${index}.quantity`}
                                                            >
                                                                Кількість
                                                            </label>

                                                            <Field
                                                                className={styles.input}
                                                                id={`services.${index}.quantity`}
                                                                name={`services.${index}.quantity`}
                                                                type="text"
                                                            />

                                                            <ErrorMessage
                                                                className={styles.error}
                                                                name={`services.${index}.quantity`}
                                                                component="p"
                                                            />
                                                        </div>

                                                        <div className={styles.group}>
                                                            <label
                                                                className={styles.label}
                                                                htmlFor={`services.${index}.unit`}
                                                            >
                                                                Одиниця виміру
                                                            </label>

                                                            <Field
                                                                className={styles.input}
                                                                id={`services.${index}.unit`}
                                                                name={`services.${index}.unit`}
                                                                type="text"
                                                            />

                                                            <ErrorMessage
                                                                className={styles.error}
                                                                name={`services.${index}.unit`}
                                                                component="p"
                                                            />
                                                        </div>

                                                        <div className={styles.group}>
                                                            <label
                                                                className={styles.label}
                                                                htmlFor={`services.${index}.price`}
                                                            >
                                                                Ціна
                                                            </label>

                                                            <Field
                                                                className={styles.input}
                                                                id={`services.${index}.price`}
                                                                name={`services.${index}.price`}
                                                                type="text"
                                                                placeholder="15423.00"
                                                            />

                                                            <ErrorMessage
                                                                className={styles.error}
                                                                name={`services.${index}.price`}
                                                                component="p"
                                                            />
                                                        </div>

                                                        <div className={styles.group}>
                                                            <label
                                                                className={styles.label}
                                                                htmlFor={`services.${index}.amount`}
                                                            >
                                                                Сума
                                                            </label>

                                                            <Field
                                                                className={styles.input}
                                                                id={`services.${index}.amount`}
                                                                name={`services.${index}.amount`}
                                                                type="text"
                                                                placeholder="15423.00"
                                                            />

                                                            <ErrorMessage
                                                                className={styles.error}
                                                                name={`services.${index}.amount`}
                                                                component="p"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                className={styles.secondaryButton}
                                                onClick={() =>
                                                    push({
                                                        route: values.route,
                                                        vehicle: values.vehicleDetails,
                                                        quantity: "1",
                                                        unit: "послуга",
                                                        price: "",
                                                        amount: "",
                                                    })
                                                }
                                            >
                                                Додати позицію
                                            </button>
                                        </div>
                                    )}
                                </FieldArray>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    className={styles.button}
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Генерація..." : "Згенерувати документи"}
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