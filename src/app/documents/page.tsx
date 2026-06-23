import { Suspense } from "react";

import AuthHeader from "@/app/components/Auth/AuthHeader";
import TransportationForm from "@/app/components/TransportationDocuments/TransportationForm";

export default function DocumentsPage() {

    return (
        <>
            <AuthHeader />

            <Suspense fallback={<div>Завантаження форми...</div>}>
                <TransportationForm />
            </Suspense>
        </>
    );
}