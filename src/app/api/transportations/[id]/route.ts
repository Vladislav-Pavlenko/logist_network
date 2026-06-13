import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserFromCookie } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { deleteFromR2 } from "@/app/lib/r2";

export const runtime = "nodejs";

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

type UpdateTransportationBody = {
    title?: string;
    route?: string;
    customerCompany?: string;
    carrierCompany?: string;
    vehicleDetails?: string;
    cargoDetails?: string;
};

function toStringOrNull(value: unknown) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim();

    return trimmedValue || null;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
    try {
        const currentUser = await getCurrentUserFromCookie();

        if (!currentUser) {
            return NextResponse.json(
                { message: "Необхідно увійти в акаунт" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const record = await prisma.transportationRecord.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                route: true,
                customerCompany: true,
                carrierCompany: true,
                vehicleDetails: true,
                cargoDetails: true,
                formData: true,
                createdAt: true,
                updatedAt: true,
                createdById: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
        });

        if (!record) {
            return NextResponse.json(
                { message: "Папку не знайдено" },
                { status: 404 }
            );
        }

        if (
            currentUser.role !== "ADMIN" &&
            record.createdById !== currentUser.userId
        ) {
            return NextResponse.json(
                { message: "Немає доступу" },
                { status: 403 }
            );
        }

        return NextResponse.json({ record });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка отримання папки" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const currentUser = await getCurrentUserFromCookie();

        if (!currentUser) {
            return NextResponse.json(
                { message: "Необхідно увійти в акаунт" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = (await req.json()) as UpdateTransportationBody;

        const existingRecord = await prisma.transportationRecord.findUnique({
            where: { id },
            select: {
                id: true,
                createdById: true,
            },
        });

        if (!existingRecord) {
            return NextResponse.json(
                { message: "Папку не знайдено" },
                { status: 404 }
            );
        }

        if (
            currentUser.role !== "ADMIN" &&
            existingRecord.createdById !== currentUser.userId
        ) {
            return NextResponse.json(
                { message: "Немає доступу" },
                { status: 403 }
            );
        }

        const route = toStringOrNull(body.route);
        const customerCompany = toStringOrNull(body.customerCompany);
        const carrierCompany = toStringOrNull(body.carrierCompany);

        const record = await prisma.transportationRecord.update({
            where: { id },
            data: {
                title:
                    toStringOrNull(body.title) ||
                    route ||
                    customerCompany ||
                    carrierCompany,
                route,
                customerCompany,
                carrierCompany,
                vehicleDetails: toStringOrNull(body.vehicleDetails),
                cargoDetails: toStringOrNull(body.cargoDetails),
            },
            select: {
                id: true,
                title: true,
                route: true,
                customerCompany: true,
                carrierCompany: true,
                vehicleDetails: true,
                cargoDetails: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            message: "Папку оновлено",
            record,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка оновлення папки" },
            { status: 500 }
        );
    }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const currentUser = await getCurrentUserFromCookie();

        if (!currentUser) {
            return NextResponse.json(
                { message: "Необхідно увійти в акаунт" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const record = await prisma.transportationRecord.findUnique({
            where: {
                id,
            },
            include: {
                documents: {
                    select: {
                        id: true,
                        storageKey: true,
                    },
                },
            },
        });

        if (!record) {
            return NextResponse.json(
                { message: "Папку не знайдено" },
                { status: 404 }
            );
        }

        if (
            currentUser.role !== "ADMIN" &&
            record.createdById !== currentUser.userId
        ) {
            return NextResponse.json(
                { message: "Немає доступу" },
                { status: 403 }
            );
        }

        for (const document of record.documents) {
            await deleteFromR2(document.storageKey);
        }

        await prisma.transportationRecord.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            message: "Папку видалено",
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка видалення папки" },
            { status: 500 }
        );
    }
}