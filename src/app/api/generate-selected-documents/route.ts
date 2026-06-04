import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import JSZip from "jszip";

import { formatOrderDate } from "@/app/api/utils/formatOrderDate";
import { capitalizeText } from "@/app/api/utils/capitalizeText";
import { formatBankDetails } from "@/app/api/utils/formatBankDetails";
import { sanitizeFileName } from "@/app/api/utils/sanitizeFileName";

type DocumentType =
    | "transportOrderAgreement"
    | "customerOrderAgreement"
    | "act"
    | "invoice";

type VatMode = "withoutVat" | "withVat";

type ServiceItem = {
    route: string;
    vehicle: string;
    quantity: string;
    unit: string;
    price: string;
    amount: string;
};

type PreparedServiceItem = {
    index: number;
    serviceName: string;
    quantity: string;
    unit: string;
    price: string;
    amount: string;
};

type DocumentData = {
    orderDate: string;
    actDate: string;
    isInternational: boolean;
    vatMode: VatMode;

    customerCompany: string;
    customerRepresentative: string;
    customerBasisOfAuthority: string;
    customerPaymentDetails: string;
    customerBankDetails: string;
    customerSignatureName: string;

    carrierCompany: string;
    carriersRepresentative: string;
    basisOfAuthority: string;
    carrierPaymentDetails: string;
    carrierBankDetails: string;
    carrierSignatureName: string;

    loadingDateAndTime: string;
    loadingDetails: string;
    unloadingDetails: string;
    route: string;
    cargoDetails: string;
    vehicleDetails: string;
    driverDetails: string;
    driversLicenseDetails: string;
    loadingUnloadingMethod: string;
    deliveryDeadline: string;
    otherDetails: string;
    cmrCount: string;

    services: ServiceItem[];
};

type GenerateDocumentsBody = {
    selectedDocuments: DocumentType[];
    data: DocumentData;
};

type DocumentConfig = {
    templateName: string;
    outputName: (data: DocumentData) => string;
};

const documentConfigs: Record<DocumentType, DocumentConfig> = {
    transportOrderAgreement: {
        templateName: "TransportOrderAgreement.docx",
        outputName: (data) =>
            `Договір-заявка з перевізником ${data.carrierCompany} ${data.route} ${data.orderDate}.docx`,
    },

    customerOrderAgreement: {
        templateName: "CustomerOrderAgreement.docx",
        outputName: (data) =>
            `Договір-заявка із замовником ${data.customerCompany} ${data.route} ${data.orderDate}.docx`,
    },

    act: {
        templateName: "Act.docx",
        outputName: (data) =>
            `Акт виконаних робіт ${data.customerCompany} ${data.route} ${data.actDate}.docx`,
    },

    invoice: {
        templateName: "Invoice.docx",
        outputName: (data) =>
            `Рахунок ${data.customerCompany} ${data.route} ${data.orderDate}.docx`,
    },
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as GenerateDocumentsBody;

        const { selectedDocuments, data } = body;

        if (!selectedDocuments || selectedDocuments.length === 0) {
            return NextResponse.json(
                { message: "Не вибрано жодного документа" },
                { status: 400 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { message: "Не передано дані для генерації" },
                { status: 400 }
            );
        }

        if (!data.orderDate?.trim()) {
            return NextResponse.json(
                { message: "Не вказано дату заявки" },
                { status: 400 }
            );
        }

        if (selectedDocuments.includes("act") && !data.actDate?.trim()) {
            return NextResponse.json(
                { message: "Не вказано дату складання акта" },
                { status: 400 }
            );
        }

        if (
            (selectedDocuments.includes("act") ||
                selectedDocuments.includes("invoice")) &&
            (!data.services || data.services.length === 0)
        ) {
            return NextResponse.json(
                { message: "Додай хоча б одну послугу для акта або рахунку" },
                { status: 400 }
            );
        }

        const generatedDocuments = selectedDocuments.map((documentType) => {
            const config = documentConfigs[documentType];

            if (!config) {
                throw new Error(`Невідомий тип документа: ${documentType}`);
            }

            const buffer = generateDocxFromTemplate(config.templateName, data);

            return {
                fileName: sanitizeFileName(config.outputName(data)),
                buffer,
            };
        });

        if (generatedDocuments.length === 1) {
            const document = generatedDocuments[0];

            return new NextResponse(new Uint8Array(document.buffer), {
                status: 200,
                headers: {
                    "Content-Type":
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
                        document.fileName
                    )}`,
                },
            });
        }

        const zip = new JSZip();

        generatedDocuments.forEach((document) => {
            zip.file(document.fileName, document.buffer);
        });

        const zipBuffer = await zip.generateAsync({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        const zipName = sanitizeFileName(
            `Документи ${data.route} ${data.orderDate}.zip`
        );

        return new NextResponse(new Uint8Array(zipBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
                    zipName
                )}`,
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Помилка генерації документів" },
            { status: 500 }
        );
    }
}

function generateDocxFromTemplate(
    templateName: string,
    data: DocumentData
): Buffer {
    const templatePath = path.join(process.cwd(), "templates", templateName);

    if (!fs.existsSync(templatePath)) {
        throw new Error(`Шаблон не знайдено: ${templatePath}`);
    }

    const content = fs.readFileSync(templatePath, "binary");

    const zip = new PizZip(content);

    const files = Object.keys(zip.files);

    if (!files.includes("word/document.xml")) {
        throw new Error(
            `Файл ${templateName} не є коректним .docx шаблоном. Немає word/document.xml`
        );
    }

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    const formattedOrderDate = formatOrderDate(data.orderDate);
    const formattedActDate = formatOrderDate(data.actDate || data.orderDate);

    const formattedCarrierBankDetails = formatBankDetails(
        data.carrierBankDetails || ""
    );

    const formattedCustomerBankDetails = formatBankDetails(
        data.customerBankDetails || ""
    );

    const preparedServices = prepareServices(
        data.services || [],
        data.isInternational
    );

    const serviceItemsCount = preparedServices.length;

    const totalAmount = calculateTotalAmount(preparedServices);

    const priceColumnTitle =
        data.vatMode === "withVat" ? "Ціна з ПДВ" : "Ціна без ПДВ";

    const amountColumnTitle =
        data.vatMode === "withVat" ? "Сума з ПДВ" : "Сума без ПДВ";

    const totalLabel =
        data.vatMode === "withVat" ? "Разом з ПДВ:" : "Разом без ПДВ:";

    const totalVatText = data.vatMode === "withVat" ? "з ПДВ" : "без ПДВ";

    const totalAmountWords = moneyToWords(totalAmount);

    doc.render({
        ...data,

        orderDate: formattedOrderDate,
        actDate: formattedActDate,

        isInternational: data.isInternational ? "міжнародне " : "",

        customerCompany: data.customerCompany?.toUpperCase() || "",
        customerRepresentative: data.customerRepresentative?.trim() || "",
        customerBasisOfAuthority: capitalizeText(
            data.customerBasisOfAuthority || "",
            "first"
        ),

        carrierCompany: data.carrierCompany?.toUpperCase() || "",
        carriersRepresentative: data.carriersRepresentative?.trim() || "",
        basisOfAuthority: capitalizeText(data.basisOfAuthority || "", "first"),

        carrierBankDetailsTitle: formattedCarrierBankDetails.bankDetailsTitle,
        carrierBankDetailsText: formattedCarrierBankDetails.bankDetailsText,

        customerBankDetailsTitle: formattedCustomerBankDetails.bankDetailsTitle,
        customerBankDetailsText: formattedCustomerBankDetails.bankDetailsText,

        services: preparedServices,
        serviceItemsCount,

        priceColumnTitle,
        amountColumnTitle,
        totalLabel,
        totalAmount,
        totalVatText,
        totalAmountWords,
    });

    return doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
}

function prepareServices(
    services: ServiceItem[],
    isInternational: boolean
): PreparedServiceItem[] {
    return services.map((item, index) => ({
        index: index + 1,
        serviceName: buildServiceName(item, isInternational),
        quantity: item.quantity || "",
        unit: item.unit || "",
        price: formatMoney(item.price || "0"),
        amount: formatMoney(item.amount || "0"),
    }));
}

function buildServiceName(
    item: ServiceItem,
    isInternational: boolean
): string {
    const serviceType = isInternational
        ? "Міжнародні транспортні послуги"
        : "Транспортні послуги";

    const route = item.route?.trim() || "";
    const vehicle = item.vehicle?.trim() || "";

    if (route && vehicle) {
        return `${serviceType} по маршруту: ${route}, автомобілем ${vehicle}`;
    }

    if (route) {
        return `${serviceType} по маршруту: ${route}`;
    }

    if (vehicle) {
        return `${serviceType} автомобілем ${vehicle}`;
    }

    return serviceType;
}

function calculateTotalAmount(services: PreparedServiceItem[]): string {
    const total = services.reduce((sum, item) => {
        const amount = parseMoney(item.amount);

        return sum + amount;
    }, 0);

    return formatMoney(String(total));
}

function parseMoney(value: string): number {
    const normalizedValue = String(value)
        .replace(/\s/g, "")
        .replace(",", ".");

    const numberValue = Number(normalizedValue);

    return Number.isNaN(numberValue) ? 0 : numberValue;
}

function formatMoney(value: string): string {
    const numberValue = parseMoney(value);

    return numberValue.toLocaleString("uk-UA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function moneyToWords(value: string): string {
    const numberValue = parseMoney(value);

    if (Number.isNaN(numberValue)) {
        return value;
    }

    const hryvnias = Math.floor(numberValue);
    const kopiyky = Math.round((numberValue - hryvnias) * 100);

    const hryvniaWords = numberToUkrainianWords(hryvnias);
    const hryvniaLabel = getHryvniaLabel(hryvnias);
    const kopiykyText = String(kopiyky).padStart(2, "0");

    return `${capitalizeText(
        hryvniaWords,
        "first"
    )} ${hryvniaLabel} ${kopiykyText} копійок`;
}

function numberToUkrainianWords(num: number): string {
    if (num === 0) return "нуль";

    const onesFeminine = [
        "",
        "одна",
        "дві",
        "три",
        "чотири",
        "пʼять",
        "шість",
        "сім",
        "вісім",
        "девʼять",
    ];

    const onesMasculine = [
        "",
        "один",
        "два",
        "три",
        "чотири",
        "пʼять",
        "шість",
        "сім",
        "вісім",
        "девʼять",
    ];

    const teens = [
        "десять",
        "одинадцять",
        "дванадцять",
        "тринадцять",
        "чотирнадцять",
        "пʼятнадцять",
        "шістнадцять",
        "сімнадцять",
        "вісімнадцять",
        "девʼятнадцять",
    ];

    const tens = [
        "",
        "",
        "двадцять",
        "тридцять",
        "сорок",
        "пʼятдесят",
        "шістдесят",
        "сімдесят",
        "вісімдесят",
        "девʼяносто",
    ];

    const hundreds = [
        "",
        "сто",
        "двісті",
        "триста",
        "чотириста",
        "пʼятсот",
        "шістсот",
        "сімсот",
        "вісімсот",
        "девʼятсот",
    ];

    function convertBelowThousand(value: number, feminine: boolean): string {
        const result: string[] = [];

        const h = Math.floor(value / 100);
        const t = Math.floor((value % 100) / 10);
        const o = value % 10;

        if (h) result.push(hundreds[h]);

        if (t === 1) {
            result.push(teens[o]);
        } else {
            if (t) result.push(tens[t]);
            if (o) result.push(feminine ? onesFeminine[o] : onesMasculine[o]);
        }

        return result.join(" ");
    }

    const parts: string[] = [];

    const millions = Math.floor(num / 1_000_000);
    const thousands = Math.floor((num % 1_000_000) / 1000);
    const rest = num % 1000;

    if (millions > 0) {
        parts.push(convertBelowThousand(millions, false));
        parts.push(getMillionLabel(millions));
    }

    if (thousands > 0) {
        parts.push(convertBelowThousand(thousands, true));
        parts.push(getThousandLabel(thousands));
    }

    if (rest > 0) {
        parts.push(convertBelowThousand(rest, true));
    }

    return parts.join(" ");
}

function getMillionLabel(value: number): string {
    const lastTwo = value % 100;
    const lastOne = value % 10;

    if (lastTwo >= 11 && lastTwo <= 14) return "мільйонів";
    if (lastOne === 1) return "мільйон";
    if (lastOne >= 2 && lastOne <= 4) return "мільйони";

    return "мільйонів";
}

function getThousandLabel(value: number): string {
    const lastTwo = value % 100;
    const lastOne = value % 10;

    if (lastTwo >= 11 && lastTwo <= 14) return "тисяч";
    if (lastOne === 1) return "тисяча";
    if (lastOne >= 2 && lastOne <= 4) return "тисячі";

    return "тисяч";
}

function getHryvniaLabel(value: number): string {
    const lastTwo = value % 100;
    const lastOne = value % 10;

    if (lastTwo >= 11 && lastTwo <= 14) return "гривень";
    if (lastOne === 1) return "гривня";
    if (lastOne >= 2 && lastOne <= 4) return "гривні";

    return "гривень";
}