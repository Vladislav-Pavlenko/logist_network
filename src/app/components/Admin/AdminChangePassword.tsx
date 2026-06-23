"use client";

import { useState } from "react";
import styles from "./AdminChangePassword.module.css";

export function AdminChangePassword() {
    const [targetEmail, setTargetEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus(null);

        if (newPassword !== confirmPassword) {
            setStatus({ type: "error", text: "Нові паролі не збігаються" });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/admin/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetEmail, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Помилка при зміні пароля");
            }

            setStatus({ type: "success", text: "Пароль успішно оновлено!" });
            setTargetEmail("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setStatus({
                type: "error",
                text: error instanceof Error ? error.message : "Сталася помилка",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>Зміна пароля користувача</h3>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.group}>
                    <label className={styles.label}>Email користувача</label>
                    <input
                        type="email"
                        placeholder="Введіть email"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Новий пароль</label>
                    <input
                        type="password"
                        placeholder="Мінімум 6 символів"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Підтвердження пароля</label>
                    <input
                        type="password"
                        placeholder="Повторіть пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.button}
                >
                    {isLoading ? "Оновлення..." : "Зберегти пароль"}
                </button>
            </form>

            {status && (
                <div className={status.type === "error" ? styles.error : styles.message}>
                    {status.text}
                </div>
            )}
        </div>
    );
}