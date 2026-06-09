import {
    FieldArray,
    useFormikContext,
} from "formik";

import styles from "../TransportationForm.module.css";

import { FormValues } from "../types";
import { TextInput } from "./TextInput";

export function TransportCostSegmentsFields() {
    const { values } = useFormikContext<FormValues>();

    return (
        <>
            <div className={styles.groupFull}>
                <h2 className={styles.blockTitle}>
                    Ділянки маршруту
                </h2>
            </div>

            <FieldArray name="transportCostSegments">
                {({ push, remove }) => (
                    <div className={styles.groupFull}>
                        {values.transportCostSegments.map(
                            (_, index) => (
                                <div
                                    className={styles.serviceCard}
                                    key={index}
                                >
                                    <div className={styles.serviceHeader}>
                                        <h3 className={styles.serviceTitle}>
                                            Ділянка {index + 1}
                                        </h3>

                                        {values.transportCostSegments.length >
                                            1 && (
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.removeButton
                                                    }
                                                    onClick={() =>
                                                        remove(index)
                                                    }
                                                >
                                                    Видалити
                                                </button>
                                            )}
                                    </div>

                                    <div className={styles.grid}>
                                        <TextInput
                                            name={`transportCostSegments.${index}.from`}
                                            label="Звідки"
                                            placeholder="м. Chaineux (Бельгія)"
                                        />

                                        <TextInput
                                            name={`transportCostSegments.${index}.to`}
                                            label="Куди"
                                            placeholder="п/п Долгобичув (Польща)"
                                        />

                                        <TextInput
                                            name={`transportCostSegments.${index}.distanceKm`}
                                            label="Відстань, км"
                                            placeholder="1525"
                                        />

                                        <TextInput
                                            name={`transportCostSegments.${index}.amount`}
                                            label="Вартість, грн"
                                            placeholder="13000"
                                        />
                                    </div>
                                </div>
                            )
                        )}

                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() =>
                                push({
                                    from: "",
                                    to: "",
                                    distanceKm: "",
                                    amount: "",
                                })
                            }
                        >
                            Додати ділянку
                        </button>
                    </div>
                )}
            </FieldArray>
        </>
    );
}