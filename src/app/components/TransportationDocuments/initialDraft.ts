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
    customerBasisOfAuthority: "",
    customerPaymentDetails: "",
    customerBankDetails: "",
    customerSignatureName: "",

    carrierCompany: "",
    carrierRepresentativeGenitive: "",
    carriersRepresentative: "",
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

    forwarderReportDate: "",
    forwarderReportCity: "",

    forwardingAgreementDetails: "",

    actualCarrierCompany: "",

    customerServiceAmount: "",
    carrierServiceAmount: "",
    forwarderRewardAmount: "",

    carrierActDetails: "",

    attachmentsCount: "",

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
};