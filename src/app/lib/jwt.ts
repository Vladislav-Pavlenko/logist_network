import { jwtVerify, SignJWT } from "jose";

export type AuthPayload = {
    userId: string;
    email: string;
    role: "ADMIN" | "LOGISTICIAN";
};

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET
);

export async function signToken(payload: AuthPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

export async function verifyToken(
    token: string
): Promise<AuthPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);

        return {
            userId: String(payload.userId),
            email: String(payload.email),
            role: payload.role as "ADMIN" | "LOGISTICIAN",
        };
    } catch {
        return null;
    }
}