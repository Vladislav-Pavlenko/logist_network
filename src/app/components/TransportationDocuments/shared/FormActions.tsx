import Link from "next/link";

import styles from "../TransportationForm.module.css";

type FormActionsProps = {
    isSubmitting: boolean;
    status?: string;
    buttonText: string;
    folderRecordId?: string | null;
};

export function FormActions({
                                isSubmitting,
                                status,
                                buttonText,
                                folderRecordId,
                            }: FormActionsProps) {
    return (
        <div className={styles.formActions}>
            <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Генерація..." : buttonText}
            </button>

            {status && <p className={styles.status}>{status}</p>}

            {folderRecordId && (
                <Link
                    href={`/documents/search/${folderRecordId}`}
                    className={styles.openFolderButton}
                >
                    Відкрити папку
                </Link>
            )}
        </div>
    );
}