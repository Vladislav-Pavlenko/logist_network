export type DocumentType =
    | "transportOrderAgreement"
    | "customerOrderAgreement"
    | "act"
    | "invoice";

export type VatMode = "withoutVat" | "withVat";

export type ServiceItem = {
    route: string;
    vehicle: string;
    quantity: string;
    unit: string;
    price: string;
    amount: string;
};

export type PreparedServiceItem = {
    index: number;
    serviceName: string;
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
    customerBasisOfAuthority: string;
    customerPaymentDetails: string;
    customerBankDetails: string;
    customerSignatureName: string;

    carrierCompany: string;
    carriersRepresentative: string;
    carrierRepresentativeGenitive: string;
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

export type GenerateDocumentsBody = {
    selectedDocuments: DocumentType[];
    data: DocumentData;
};