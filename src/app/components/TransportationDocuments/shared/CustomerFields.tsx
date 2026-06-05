import styles from "../TransportationForm.module.css";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";

export function CustomerFields() {
    return (
        <>
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
                placeholder="Наприклад, Галанзовський Андрій Михайлович"
            />

            <TextInput
                name="customerRepresentativeGenitive"
                label="Представник замовника у родовому відмінку"
                placeholder="Наприклад, директора Галанзовського Андрія Михайловича"
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
        </>
    );
}