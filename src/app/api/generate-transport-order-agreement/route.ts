import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import {formatOrderDate} from "@/app/api/utils/formatOrderDate";
import {capitalizeText} from "@/app/api/utils/capitalizeText";
import {formatBankDetails} from "@/app/api/utils/formatBankDetails";
import {sanitizeFileName} from "@/app/api/utils/sanitizeFileName";

type GenerateDocxBody = {
    orderDate: string;
    isInternational: boolean;
    carrierCompany: string;
    carriersRepresentative: string;
    basisOfAuthority: string;
    loadingDateAndTime: string;
    loadingDetails: string;
    unloadingDetails: string;
    route: string;
    cargoDetails: string;
    vehicleDetails: string;
    driverDetails: string;
    driversLicenseDetails: string;
    loadingUnloadingMethod: string;
    paymentDetails: string;
    deliveryDeadline: string;
    otherDetails: string;
    cmrCount: string;
    bankDetails: string;
    carrierSignatureName: string;
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as GenerateDocxBody;

        const {
            orderDate,
            isInternational,
            carrierCompany,
            carriersRepresentative,
            basisOfAuthority,
            loadingDateAndTime,
            loadingDetails,
            unloadingDetails,
            route,
            cargoDetails,
            vehicleDetails,
            driverDetails,
            driversLicenseDetails,
            loadingUnloadingMethod,
            paymentDetails,
            deliveryDeadline,
            otherDetails,
            cmrCount,
            bankDetails,
            carrierSignatureName,
        } = body;

        if (!orderDate?.trim()) {
            return NextResponse.json(
                { message: "Не вказано дату заявки" },
                { status: 400 }
            );
        }

        if (!carrierCompany?.trim()) {
            return NextResponse.json(
                { message: "Не вказано організацію перевізника" },
                { status: 400 }
            );
        }

        const templatePath = path.join(
            process.cwd(),
            "templates",
            "TransportOrderAgreement.docx"
        );

        const content = fs.readFileSync(templatePath, "binary");

        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        const formattedOrderDate = formatOrderDate(orderDate);
        const formattedBankDetails = formatBankDetails(bankDetails);

        doc.render({
            orderDate: formattedOrderDate,
            isInternational: isInternational ? "міжнародне " : "",
            carrierCompany: carrierCompany.toUpperCase(),
            carriersRepresentative: capitalizeText(carriersRepresentative, "words"),
            basisOfAuthority: capitalizeText(basisOfAuthority, "first"),
            loadingDateAndTime,
            loadingDetails,
            unloadingDetails,
            route,
            cargoDetails,
            vehicleDetails,
            driverDetails,
            driversLicenseDetails,
            loadingUnloadingMethod,
            paymentDetails,
            deliveryDeadline,
            otherDetails,
            cmrCount,

            bankDetailsTitle: formattedBankDetails.bankDetailsTitle,
            bankDetailsText: formattedBankDetails.bankDetailsText,
            carrierSignatureName
        });

        const buffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });


        const fileName = sanitizeFileName(
            `Договір-заявка з перевізником ${carrierCompany} ${route} ${orderDate}.docx`
        );

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка генерації заявки" },
            { status: 500 }
        );
    }
}