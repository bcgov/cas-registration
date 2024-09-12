import ContactPage from "@/administration/app/components/contacts/ContactPage";

export default function Page({
  params: { contactId },
}: Readonly<{ params: { contactId: string } }>) {
  console.log("!!!!!!!!!");
  console.log("contactId in [contactid] page.tsx", contactId);
  return <ContactPage contactId={contactId} />;
}
