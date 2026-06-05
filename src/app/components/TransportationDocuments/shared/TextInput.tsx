import { ErrorMessage, Field } from "formik";
import styles from "../TransportationForm.module.css";

type TextInputProps = {
    name: string;
    label: string;
    placeholder?: string;
    type?: string;
};

export function TextInput({
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