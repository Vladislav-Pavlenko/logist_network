import { DocumentData, DocumentType } from "./documentTypes";

type DocumentConfig = {
    templateName: string;
    outputName: (data: DocumentData) => string;
};

export const documentConfigs: Record<DocumentType, DocumentConfig> = {
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
            `Рахунок ${data.customerCompany} ${data.route} ${data.invoiceDate}.docx`,
    },

    forwarderReport: {
        templateName: "ForwarderReport.docx",
        outputName: (data) =>
            `Звіт експедитора ${data.customerCompany} ${data.route} ${data.forwarderReportDate}.docx`,
    },

    customerForwardingAgreement: {
        templateName: "CustomerForwardingAgreement.docx",
        outputName: (data) =>
            `Договір транспортної експедиції ${data.customerCompany} ${data.forwardingAgreementNumber}.docx`,
    },

    carrierForwardingAgreement: {
        templateName: "CarrierForwardingAgreement.docx",

        outputName: (data) =>
            `Договір транспортної експедиції з перевізником ${data.carrierCompany} ${data.forwardingAgreementNumber}.docx`,
    },

    transportCostsCertificate: {
        templateName: "TransportCostsCertificate.docx",

        outputName: (data) =>
            `Довідка про транспортні витрати ${data.transportCostsCustomerCompany} ${data.transportCostsCertificateDate}.docx`,
    },
};