import AuthHeader from "@/app/components/Auth/AuthHeader";
import TransportationRecordDocuments from "@/app/components/TransportationRecords/TransportationRecordDocuments";

export default function TransportationRecordPage() {
    return (
        <>
            <AuthHeader />
            <TransportationRecordDocuments />
        </>
    );
}