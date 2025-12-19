import ContactPage from "apps/administration/app/components/contacts/ContactPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page(
  props: Readonly<{ params: Promise<{ contactId: string }> }>,
) {
  const params = await props.params;

  const { contactId } = params;

  return (
    <Suspense fallback={<Loading />}>
      <ContactPage contactId={contactId} />
    </Suspense>
  );
}
