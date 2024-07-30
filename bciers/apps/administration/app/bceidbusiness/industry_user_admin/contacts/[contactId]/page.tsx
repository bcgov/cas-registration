import ContactPage from "@/administration/app/components/contacts/ContactPage";

export default function Page({
  params: { contactId },
}: Readonly<{ params: { contactId: string } }>) {
  return <ContactPage contactId={contactId} />;
}
