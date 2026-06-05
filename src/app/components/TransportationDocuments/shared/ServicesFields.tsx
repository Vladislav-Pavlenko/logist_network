import { ErrorMessage, Field, FieldArray, useFormikContext } from "formik";
import styles from "../TransportationForm.module.css";
import { FormValues } from "../types";
import { TextInput } from "./TextInput";

export function ServicesFields() {
    const { values, setFieldValue } = useFormikContext<FormValues>();

    return (
        <>
            <div className={styles.groupFull}>
                <h2 className={styles.blockTitle}>Послуги</h2>
            </div>

            <div className={styles.groupFull}>
                <p className={styles.label}>ПДВ</p>

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

                <ErrorMessage className={styles.error} name="vatMode" component="p" />
            </div>

            <FieldArray name="services">
                {({ push, remove }) => (
                    <div className={styles.groupFull}>
                        {values.services.map((_, index) => (
                            <div className={styles.serviceCard} key={index}>
                                <div className={styles.serviceHeader}>
                                    <h3 className={styles.serviceTitle}>Позиція {index + 1}</h3>

                                    <div className={styles.serviceActions}>
                                        <button
                                            type="button"
                                            className={styles.secondaryButton}
                                            onClick={() => {
                                                setFieldValue(`services.${index}.route`, values.route);
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
                                    <TextInput
                                        name={`services.${index}.route`}
                                        label="Маршрут послуги"
                                        placeholder="Польща, с. Ясениця - ПП Грушів"
                                    />

                                    <TextInput
                                        name={`services.${index}.vehicle`}
                                        label="Транспорт"
                                        placeholder="FIAT DUCATO №А/М ВС 3488 НК"
                                    />

                                    <TextInput
                                        name={`services.${index}.quantity`}
                                        label="Кількість"
                                    />

                                    <TextInput
                                        name={`services.${index}.unit`}
                                        label="Одиниця виміру"
                                    />

                                    <TextInput
                                        name={`services.${index}.price`}
                                        label="Ціна"
                                        placeholder="15423.00"
                                    />

                                    <TextInput
                                        name={`services.${index}.amount`}
                                        label="Сума"
                                        placeholder="15423.00"
                                    />
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
        </>
    );
}