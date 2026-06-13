import { cookies } from "next/headers";

import { verifyToken } from "./jwt";

export async function getCurrentUserFromCookie() {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
        return null;
    }

    return verifyToken(token);
}