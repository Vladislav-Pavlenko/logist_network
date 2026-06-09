import { GenerateDocumentsBody } from "./documentTypes";

export function validateGenerateDocumentsRequest(
    body: GenerateDocumentsBody
): string | null {
    const { selectedDocuments, data } = body;

    if (!selectedDocuments || selectedDocuments.length === 0) {
        return "Не вибрано жодного документа";
    }

    if (!data) {
        return "Не передано дані для генерації";
    }

    if (
        (selectedDocuments.includes("transportOrderAgreement") ||
            selectedDocuments.includes("customerOrderAgreement")) &&
        !data.orderDate?.trim()
    ) {
        return "Не вказано дату заявки";
    }

    if (selectedDocuments.includes("act") && !data.actDate?.trim()) {
        return "Не вказано дату складання акта";
    }

    if (selectedDocuments.includes("invoice") && !data.invoiceDate?.trim()) {
        return "Не вказано дату складання рахунку";
    }

    if (
        (selectedDocuments.includes("act") ||
            selectedDocuments.includes("invoice")) &&
        !data.customerOrderDetails?.trim()
    ) {
        return "Не вказано дані заявки / договору із замовником";
    }

    if (
        (selectedDocuments.includes("act") ||
            selectedDocuments.includes("invoice")) &&
        (!data.services || data.services.length === 0)
    ) {
        return "Додай хоча б одну послугу для акта або рахунку";
    }

    if (
        selectedDocuments.includes("forwarderReport") &&
        !data.forwarderReportDate?.trim()
    ) {
        return "Не вказано дату складання звіту експедитора";
    }

    if (
        selectedDocuments.includes("forwarderReport") &&
        !data.customerServiceAmount?.trim()
    ) {
        return "Не вказано суму, отриману від замовника";
    }

    if (
        selectedDocuments.includes("forwarderReport") &&
        !data.carrierServiceAmount?.trim()
    ) {
        return "Не вказано суму, сплачену перевізнику";
    }

    return null;
}