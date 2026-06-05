import styles from "../TransportationForm.module.css";

type FormActionsProps = {
    isSubmitting: boolean;
    status?: string;
    buttonText?: string;
};

export function FormActions({
                                isSubmitting,
                                status,
                                buttonText = "Згенерувати документ",
                            }: FormActionsProps) {
    return (
        <div className={styles.actions}>
            <button className={styles.button} type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Генерація..." : buttonText}
            </button>

            {status && <p className={styles.status}>{status}</p>}
        </div>
    );
}