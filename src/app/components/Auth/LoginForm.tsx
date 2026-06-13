"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import styles from "./AuthForm.module.css";

type LoginResponse = {
    message: string;
    user?: {
        id: string;
        name: string;
        email: string;
        role: "ADMIN" | "LOGISTICIAN";
    };
};

export function LoginForm() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setError("");
            setIsLoading(true);

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = (await response.json()) as LoginResponse;

            if (!response.ok) {
                throw new Error(data.message || "Помилка входу");
            }

            router.push("/documents");
            router.refresh();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка входу"
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Вхід</h1>

                    <p className={styles.subtitle}>
                        Увійдіть, щоб перейти до генерації документів
                    </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
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
                            placeholder="Введіть пароль"
                            autoComplete="current-password"
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
                        {isLoading ? "Вхід..." : "Увійти"}
                    </button>
                </form>

                <p className={styles.footer}>
                    Ще немає акаунта?{" "}
                    <Link href="/register">
                        Зареєструватися
                    </Link>
                </p>
            </section>
        </main>
    );
}