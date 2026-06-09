import { DocumentData } from "./types";

export const initialDraft: DocumentData = {
    orderDate: "",
    customerOrderDetails: "",
    actDate: "",
    invoiceDate: "",

    isInternational: false,
    vatMode: "withoutVat",

    customerCompany: "",
    customerRepresentative: "",
    customerRepresentativeGenitive: "",
    customerRepresentativePosition: "",
    customerBasisOfAuthority: "",
    customerPaymentDetails: "",
    customerBankDetails: "",
    customerSignatureName: "",

    carrierCompany: "",
    carriersRepresentative: "",
    carrierRepresentativeGenitive: "",
    basisOfAuthority: "",
    carrierPaymentDetails: "",
    carrierBankDetails: "",
    carrierSignatureName: "",

    loadingDateAndTime: "",
    loadingDetails: "",
    unloadingDetails: "",
    route: "",
    cargoDetails: "",
    vehicleDetails: "",
    driverDetails: "",
    driversLicenseDetails: "",
    loadingUnloadingMethod: "",
    deliveryDeadline: "",
    otherDetails: "",
    cmrCount: "",

    services: [
        {
            route: "",
            vehicle: "",
            quantity: "1",
            unit: "послуга",
            price: "",
            amount: "",
        },
    ],

    forwarderReportDate: "",
    forwarderReportCity: "",
    forwardingAgreementDetails: "",
    actualCarrierCompany: "",
    customerServiceAmount: "",
    carrierServiceAmount: "",
    carrierRepresentativePosition: "",
    forwarderRewardAmount: "",
    carrierActDetails: "",
    attachmentsCount: "5",

    transportCostsCertificateDate: "",
    transportCostsCertificateNumber: "Б/Н",
    transportCostsCertificateRecipient: "Для надання в митні органи",

    transportCostsCustomerCompany: "",
    transportCostsVehicle: "",

    transportCostSegments: [
        {
            from: "",
            to: "",
            distanceKm: "",
            amount: "",
        },
    ],

    cargoInsured: false,
    loadingWorksIncluded: true,

    forwardingAgreementNumber: "",
    forwardingAgreementDate: "",
    forwardingAgreementCity: "",
    forwardingAgreementValidUntil: "",
};