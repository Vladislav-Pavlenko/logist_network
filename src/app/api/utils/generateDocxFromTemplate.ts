import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

import { DocumentData } from "./documentTypes";
import { formatOrderDate } from "./formatOrderDate";
import { capitalizeText } from "./capitalizeText";
import { formatBankDetails } from "./formatBankDetails";
import { prepareServices, calculateTotalAmount } from "./prepareServices";
import { moneyToWords } from "./money";
import { formatDateWithYearMarker } from "./formatDateWithYearMarker";

export function generateDocxFromTemplate(
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

    const formattedOrderDate = formatOrderDate(data.orderDate || "");
    const formattedActDate = formatOrderDate(data.actDate || "");
    const formattedInvoiceDate = formatOrderDate(data.invoiceDate || "");

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
        invoiceDate: formattedInvoiceDate,

        loadingDateAndTime: formatDateWithYearMarker(
            data.loadingDateAndTime || ""
        ),

        deliveryDeadline: formatDateWithYearMarker(
            data.deliveryDeadline || ""
        ),

        customerOrderDetails: data.customerOrderDetails?.trim() || "",

        isInternational: data.isInternational ? "міжнародне " : "",

        customerCompany: data.customerCompany?.trim() || "",
        customerRepresentative: data.customerRepresentative?.trim() || "",
        customerRepresentativeGenitive:
            data.customerRepresentativeGenitive?.trim() || "",
        customerBasisOfAuthority: capitalizeText(
            data.customerBasisOfAuthority || "",
            "first"
        ),

        carrierCompany: data.carrierCompany?.trim() || "",
        carriersRepresentative: data.carriersRepresentative?.trim() || "",
        carrierRepresentativeGenitive:
            data.carrierRepresentativeGenitive?.trim() || "",
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