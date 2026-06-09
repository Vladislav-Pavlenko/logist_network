import styles from "../TransportationForm.module.css";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";

export function ForwardingAgreementCustomerFields() {
    return (
        <>
            <div className={styles.groupFull}>
                <h2 className={styles.blockTitle}>Дані замовника</h2>
            </div>

            <TextInput
                name="customerCompany"
                label="Організація замовника"
                placeholder="Наприклад, ТОВ «ТрансКомплектІмпекс»"
            />

            <TextInput
                name="customerRepresentative"
                label="ПІБ представника замовника"
                placeholder="Наприклад, Навроцький Віктор Анатолійович"
            />

            <TextInput
                name="customerRepresentativeGenitive"
                label="Посада та ПІБ у родовому відмінку"
                placeholder="Наприклад, директора Навроцького Віктора Анатолійовича"
            />

            <TextInput
                name="customerRepresentativePosition"
                label="Посада підписанта"
                placeholder="Наприклад, Директор"
            />

            <TextInput
                name="customerBasisOfAuthority"
                label="На підставі чого діє замовник"
                placeholder="Наприклад, Статуту"
            />

            <TextInput
                name="customerSignatureName"
                label="ПІБ для підпису"
                placeholder="Наприклад, В.А. Навроцький"
            />

            <TextArea
                name="customerBankDetails"
                label="Реквізити замовника"
                placeholder={`ТОВ «ТрансКомплектІмпекс»
                12134, Житомирська обл...
                р/р UA...
                ЄДРПОУ...
                тел...`}
            />
        </>
    );
}