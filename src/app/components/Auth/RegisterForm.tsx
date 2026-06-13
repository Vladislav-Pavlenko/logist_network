"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import styles from "./AuthForm.module.css";

type RegisterResponse = {
    message: string;
    user?: {
        id: string;
        name: string;
        email: string;
        role: "ADMIN" | "LOGISTICIAN";
    };
};

export function RegisterForm() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [registrationCode, setRegistrationCode] = useState("");

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setError("");
            setIsLoading(true);

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    registrationCode,
                }),
            });

            const data = (await response.json()) as RegisterResponse;

            if (!response.ok) {
                throw new Error(
                    data.message || "Помилка реєстрації"
                );
            }

            router.push("/documents");
            router.refresh();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка реєстрації"
            );
        } finally {
            setIsLoading(false);
        }
    }

    function handleRegistrationCodeChange(value: string) {
        const normalizedValue = value
            .replace(/[\s-]/g, "")
            .toUpperCase()
            .slice(0, 9);

        setRegistrationCode(normalizedValue);
    }

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Реєстрація</h1>

                    <p className={styles.subtitle}>
                        Створіть акаунт для доступу до генерації документів
                    </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.group}>
                        <span className={styles.label}>Ім’я</span>

                        <input
                            className={styles.input}
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Наприклад, Владислав"
                            autoComplete="name"
                        />
                    </label>

                    <label className={styles.group}>
                        <span className={styles.label}>Email</span>

                        <input
                            className={styles.input}
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="example@gmail.com"
                            autoComplete="email"
                        />
                    </label>

                    <label className={styles.group}>
                        <span className={styles.label}>Пароль</span>

                        <input
                            className={styles.input}
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Мінімум 6 символів"
                            autoComplete="new-password"
                        />
                    </label>

                    <label className={styles.group}>
                        <span className={styles.label}>
                            Код реєстрації
                        </span>

                        <input
                            className={styles.input}
                            type="text"
                            value={registrationCode}
                            onChange={(event) =>
                                handleRegistrationCodeChange(
                                    event.target.value
                                )
                            }
                            placeholder="9-символьний код"
                            maxLength={9}
                            autoComplete="off"
                        />
                    </label>

                    {error && (
                        <p className={styles.error}>
                            {error}
                        </p>
                    )}

                    <button
                        className={styles.button}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Реєстрація..."
                            : "Зареєструватися"}
                    </button>
                </form>

                <p className={styles.footer}>
                    Вже маєте акаунт?{" "}
                    <Link href="/login">Увійти</Link>
                </p>
            </section>
        </main>
    );
}