import styles from "../TransportationForm.module.css";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";

export function CarrierFields() {
    return (
        <>
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
                label="ПІБ представника перевізника"
                placeholder="Наприклад, Галанзовський Андрій Михайлович або Кириленко В.М."
            />

            <TextInput
                name="carrierRepresentativeGenitive"
                label="Посада + ПІБ у родовому відмінку"
                placeholder="Наприклад, директора Галанзовського Андрія Михайловича"
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
        </>
    );
}