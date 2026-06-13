import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

import { getCurrentUserFromCookie } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

type CreateTransportationBody = {
    title?: string;
    route?: string;
    customerCompany?: string;
    carrierCompany?: string;
    vehicleDetails?: string;
    cargoDetails?: string;
    formData?: Record<string, unknown>;
};

function toStringOrNull(value: unknown) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim();

    return trimmedValue || null;
}

function getStringFromFormData(
    formData: Record<string, unknown>,
    key: string
) {
    return toStringOrNull(formData[key]);
}

export async function GET(req: NextRequest) {
    try {
        const currentUser = await getCurrentUserFromCookie();

        if (!currentUser) {
            return NextResponse.json(
                { message: "Необхідно увійти в акаунт" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q")?.trim();

        const where: Prisma.TransportationRecordWhereInput = {
            ...(currentUser.role !== "ADMIN"
                ? { createdById: currentUser.userId }
                : {}),
            ...(q
                ? {
                    OR: [
                        {
                            route: {
                                contains: q,
                                mode: "insensitive",
                            },
                        },
                        {
                            customerCompany: {
                                contains: q,
                                mode: "insensitive",
                            },
                        },
                        {
                            carrierCompany: {
                                contains: q,
                                mode: "insensitive",
                            },
                        },
                    ],
                }
                : {}),
        };

        const records = await prisma.transportationRecord.findMany({
            where,
            orderBy: {
                updatedAt: "desc",
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

        return NextResponse.json({ records });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка отримання перевезень" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUserFromCookie();

        if (!currentUser) {
            return NextResponse.json(
                { message: "Необхідно увійти в акаунт" },
                { status: 401 }
            );
        }

        const body = (await req.json()) as CreateTransportationBody;

        const formData = body.formData || {};

        const route =
            toStringOrNull(body.route) ||
            getStringFromFormData(formData, "route");

        const customerCompany =
            toStringOrNull(body.customerCompany) ||
            getStringFromFormData(formData, "customerCompany") ||
            getStringFromFormData(formData, "transportCostsCustomerCompany");

        const carrierCompany =
            toStringOrNull(body.carrierCompany) ||
            getStringFromFormData(formData, "carrierCompany");

        const vehicleDetails =
            toStringOrNull(body.vehicleDetails) ||
            getStringFromFormData(formData, "vehicleDetails") ||
            getStringFromFormData(formData, "transportCostsVehicle");

        const cargoDetails =
            toStringOrNull(body.cargoDetails) ||
            getStringFromFormData(formData, "cargoDetails");

        const record = await prisma.transportationRecord.create({
            data: {
                title: toStringOrNull(body.title),
                route,
                customerCompany,
                carrierCompany,
                vehicleDetails,
                cargoDetails,
                formData: formData as Prisma.InputJsonValue,
                createdById: currentUser.userId,
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
            message: "Перевезення створено",
            record,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка створення перевезення" },
            { status: 500 }
        );
    }
}