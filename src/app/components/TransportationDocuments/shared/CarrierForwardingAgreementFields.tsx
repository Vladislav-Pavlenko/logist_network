import styles from "../TransportationForm.module.css";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";

export function CarrierForwardingAgreementFields() {
    return (
        <>
            <div className={styles.groupFull}>
                <h2 className={styles.blockTitle}>Дані перевізника</h2>
            </div>

            <TextInput
                name="carrierCompany"
                label="Організація перевізника"
                placeholder="Наприклад, ТОВ «КП Транс»"
            />

            <TextInput
                name="carriersRepresentative"
                label="ПІБ представника перевізника"
                placeholder="Наприклад, Галанзовський Андрій Михайлович"
            />

            <TextInput
                name="carrierRepresentativeGenitive"
                label="Посада та ПІБ у родовому відмінку"
                placeholder="Наприклад, директора Галанзовського Андрія Михайловича"
            />

            <TextInput
                name="carrierRepresentativePosition"
                label="Посада підписанта"
                placeholder="Наприклад, Директор"
            />

            <TextInput
                name="basisOfAuthority"
                label="На підставі чого діє перевізник"
                placeholder="Наприклад, Статуту"
            />

            <TextInput
                name="carrierSignatureName"
                label="ПІБ для підпису"
                placeholder="Наприклад, А.М. Галанзовський"
            />

            <TextArea
                name="carrierBankDetails"
                label="Реквізити перевізника"
                placeholder={`ТОВ «КП Транс»
Юридична адреса:
Код ЄДРПОУ:
р/р UA...
Назва банку:
Телефон:
Email:`}
            />
        </>
    );
}