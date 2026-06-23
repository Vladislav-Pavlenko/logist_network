"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import styles from "./AuthHeader.module.css";

type User = {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "LOGISTICIAN";
};

type MeResponse = {
    user: User | null;
};

async function fetchCurrentUser() {
    const response = await fetch("/api/auth/me");

    if (!response.ok) {
        return null;
    }

    const data = (await response.json()) as MeResponse;

    return data.user;
}

export default function AuthHeader() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadUser() {
            try {
                const currentUser = await fetchCurrentUser();

                if (!isMounted) {
                    return;
                }

                setUser(currentUser);
            } catch {
                if (!isMounted) {
                    return;
                }

                setUser(null);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadUser();

        return () => {
            isMounted = false;
        };
    }, []);

    async function handleLogout() {
        try {
            setIsLoggingOut(true);

            await fetch("/api/auth/logout", {
                method: "POST",
            });

            router.push("/login");
            router.refresh();
        } finally {
            setIsLoggingOut(false);
        }
    }

    if (isLoading) {
        return null;
    }

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href="/documents" className={styles.logo}>
                    Logistics Docs
                </Link>

                <nav className={styles.nav}>
                    <Link href="/documents" className={styles.link}>
                        Генерація
                    </Link>

                    <Link href="/documents/search" className={styles.link}>
                        Пошук документів
                    </Link>

                    {user?.role === "ADMIN" && (
                        <Link
                            href="/admin/registration-codes"
                            className={styles.link}
                        >
                            Кабінет адміністратора
                        </Link>
                    )}
                </nav>

                <div className={styles.userBox}>
                    {user && (
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>
                                {user.name}
                            </span>

                            <span className={styles.userRole}>
                                {user.role === "ADMIN"
                                    ? "Адмін"
                                    : "Логіст"}
                            </span>
                        </div>
                    )}

                    <button
                        type="button"
                        className={styles.logoutButton}
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? "Вихід..." : "Вийти"}
                    </button>
                </div>
            </div>
        </header>
    );
}