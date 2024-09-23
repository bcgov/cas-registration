import ContactPage from "@/administration/app/components/contacts/ContactPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ContactPage />
    </Suspense>
  );
}
