import styles from "../TransportationForm.module.css";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";

export function TransportationFields() {
    return (
        <>
            <div className={styles.groupFull}>
                <h2 className={styles.blockTitle}>Дані перевезення</h2>
            </div>

            <TextInput
                name="loadingDateAndTime"
                label="Дата та час завантаження"
                placeholder="04.06.2026р., 14:00"
            />

            <TextInput name="route" label="Маршрут" placeholder="Львів — Київ" />

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
        </>
    );
}