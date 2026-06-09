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

    if (
        selectedDocuments.includes("customerForwardingAgreement") &&
        !data.forwardingAgreementNumber?.trim()
    ) {
        return "Не вказано номер договору транспортної експедиції";
    }

    if (
        selectedDocuments.includes("customerForwardingAgreement") &&
        !data.forwardingAgreementDate?.trim()
    ) {
        return "Не вказано дату договору транспортної експедиції";
    }

    if (
        selectedDocuments.includes("customerForwardingAgreement") &&
        !data.forwardingAgreementCity?.trim()
    ) {
        return "Не вказано місто укладення договору";
    }

    if (
        selectedDocuments.includes("customerForwardingAgreement") &&
        !data.customerCompany?.trim()
    ) {
        return "Не вказано організацію замовника";
    }

    if (
        selectedDocuments.includes("customerForwardingAgreement") &&
        !data.customerRepresentativeGenitive?.trim()
    ) {
        return "Не вказано представника замовника у родовому відмінку";
    }

    if (
        selectedDocuments.includes("customerForwardingAgreement") &&
        !data.forwardingAgreementValidUntil?.trim()
    ) {
        return "Не вказано строк дії договору";
    }

    if (
        selectedDocuments.includes("carrierForwardingAgreement") &&
        !data.forwardingAgreementNumber?.trim()
    ) {
        return "Не вказано номер договору з перевізником";
    }

    if (
        selectedDocuments.includes("carrierForwardingAgreement") &&
        !data.forwardingAgreementDate?.trim()
    ) {
        return "Не вказано дату договору з перевізником";
    }

    if (
        selectedDocuments.includes("carrierForwardingAgreement") &&
        !data.forwardingAgreementCity?.trim()
    ) {
        return "Не вказано місто укладення договору";
    }

    if (
        selectedDocuments.includes("carrierForwardingAgreement") &&
        !data.carrierCompany?.trim()
    ) {
        return "Не вказано організацію перевізника";
    }

    if (
        selectedDocuments.includes("carrierForwardingAgreement") &&
        !data.carrierRepresentativeGenitive?.trim()
    ) {
        return "Не вказано представника перевізника у родовому відмінку";
    }

    if (
        selectedDocuments.includes("carrierForwardingAgreement") &&
        !data.forwardingAgreementValidUntil?.trim()
    ) {
        return "Не вказано строк дії договору";
    }

    if (
        selectedDocuments.includes(
            "transportCostsCertificate"
        ) &&
        !data.transportCostsCertificateDate?.trim()
    ) {
        return "Не вказано дату довідки";
    }

    if (
        selectedDocuments.includes(
            "transportCostsCertificate"
        ) &&
        !data.transportCostsCustomerCompany?.trim()
    ) {
        return "Не вказано замовника";
    }

    if (
        selectedDocuments.includes(
            "transportCostsCertificate"
        ) &&
        (
            !data.transportCostSegments ||
            data.transportCostSegments.length === 0
        )
    ) {
        return "Додай хоча б одну ділянку маршруту";
    }

    if (
        selectedDocuments.includes(
            "transportCostsCertificate"
        ) &&
        data.transportCostSegments.some(
            (segment) =>
                !segment.from?.trim() ||
                !segment.to?.trim() ||
                !segment.distanceKm?.trim() ||
                !segment.amount?.trim()
        )
    ) {
        return "Заповни всі поля ділянок маршруту";
    }

    return null;
}