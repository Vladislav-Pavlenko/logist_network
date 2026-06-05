import { ErrorMessage, Field } from "formik";
import styles from "../TransportationForm.module.css";

type TextAreaProps = {
    name: string;
    label: string;
    placeholder?: string;
};

export function TextArea({ name, label, placeholder }: TextAreaProps) {
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