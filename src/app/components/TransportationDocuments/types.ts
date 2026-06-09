export type DocumentType =
    | "transportOrderAgreement"
    | "customerOrderAgreement"
    | "act"
    | "invoice"
    | "forwarderReport"
    | "customerForwardingAgreement"
    | "carrierForwardingAgreement"
    | "transportCostsCertificate";

export type VatMode = "withoutVat" | "withVat";

export type TransportCostSegment = {
    from: string;
    to: string;
    distanceKm: string;
    amount: string;
};

export type ServiceItem = {
    route: string;
    vehicle: string;
    quantity: string;
    unit: string;
    price: string;
    amount: string;
};

export type DocumentData = {
    orderDate: string;
    customerOrderDetails: string;
    actDate: string;
    invoiceDate: string;

    isInternational: boolean;
    vatMode: VatMode;

    customerCompany: string;
    customerRepresentative: string;
    customerRepresentativeGenitive: string;
    customerRepresentativePosition: string;
    customerBasisOfAuthority: string;
    customerPaymentDetails: string;
    customerBankDetails: string;
    customerSignatureName: string;

    carrierCompany: string;
    carriersRepresentative: string;
    carrierRepresentativeGenitive: string;
    carrierRepresentativePosition: string;
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

    forwarderReportDate: string;
    forwarderReportCity: string;
    forwardingAgreementDetails: string;
    actualCarrierCompany: string;
    customerServiceAmount: string;
    carrierServiceAmount: string;
    forwarderRewardAmount: string;
    carrierActDetails: string;
    attachmentsCount: string;

    transportCostsCertificateDate: string;
    transportCostsCertificateNumber: string;
    transportCostsCertificateRecipient: string;

    transportCostsCustomerCompany: string;
    transportCostsVehicle: string;

    transportCostSegments: TransportCostSegment[];

    cargoInsured: boolean;
    loadingWorksIncluded: boolean;

    forwardingAgreementNumber: string;
    forwardingAgreementDate: string;
    forwardingAgreementCity: string;
    forwardingAgreementValidUntil: string;
};

export type FormValues = DocumentData & {
    selectedDocuments: DocumentType[];
};