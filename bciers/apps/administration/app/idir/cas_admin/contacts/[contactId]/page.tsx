import ContactPage from "@/administration/app/components/contacts/ContactPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default function Page({
  params: { contactId },
}: Readonly<{ params: { contactId: string } }>) {
  return (
    <Suspense fallback={<Loading />}>
      <ContactPage contactId={contactId} />
    </Suspense>
  );
}
